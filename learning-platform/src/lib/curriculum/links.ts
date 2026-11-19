import path from 'node:path';
import { getCurriculum, getDocsRoot } from './scan';
import { isReadmeFile, slugifySegment } from './slug';
import type { DomainId } from './types';
import fs from 'node:fs';

export interface BrokenLink {
  source: string;
  target: string;
  reason: string;
}

const brokenLinks: BrokenLink[] = [];

export function getBrokenLinks(): BrokenLink[] {
  return brokenLinks;
}

export function resetBrokenLinks(): void {
  brokenLinks.length = 0;
}

function normalizeFs(p: string): string {
  return p.replace(/\\/g, '/');
}

function findChapterByPrefix(domainId: string, shortCode: string): string | undefined {
  const curriculum = getCurriculum();
  const domain = curriculum.domains.find((d) => d.id === domainId.toUpperCase());
  if (!domain) return curriculum.shortIdIndex[shortCode.toUpperCase()];

  const upper = shortCode.toUpperCase();
  const chapter = domain.chapters.find(
    (c) => c.code.toUpperCase() === upper || c.folderName.toUpperCase().startsWith(upper),
  );
  return chapter?.href ?? curriculum.shortIdIndex[upper];
}

function resolveReadmeInDir(absDir: string): string | null {
  if (!fs.existsSync(absDir)) return null;
  const names = fs.readdirSync(absDir);
  const readme = names.find((n) => isReadmeFile(n));
  return readme ? path.join(absDir, readme) : null;
}

/**
 * Resolve a markdown href relative to the current document into a site path,
 * or return null if external / unresolvable.
 */
export function resolveMarkdownHref(
  href: string,
  sourceRelativePath: string,
  domainId: DomainId,
): { sitePath: string | null; external: boolean; broken: boolean } {
  if (!href || href.startsWith('#')) {
    return { sitePath: href || null, external: false, broken: false };
  }
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return { sitePath: href, external: true, broken: false };
  }

  const [rawPath, hash] = href.split('#');
  const hashSuffix = hash ? `#${hash}` : '';
  const curriculum = getCurriculum();
  const docsRoot = getDocsRoot();
  const sourceDir = path.dirname(path.join(docsRoot, sourceRelativePath));

  // Short paths without spaces: ENG, AIF, ENG-02, ./AGT-03/README.md
  const shortPath = rawPath.replace(/^\.\//, '').replace(/\/$/, '');
  const domainOnly = shortPath.match(/^(ENG|AIF|LLM|RET|AGT|PROD|ENT)$/i);
  if (domainOnly) {
    const domain = curriculum.domains.find((d) => d.id === domainOnly[1].toUpperCase());
    if (domain) {
      return { sitePath: `${domain.href}${hashSuffix}`, external: false, broken: false };
    }
  }

  const shortMatch = shortPath.match(/^([A-Za-z]+-\d+)(?:\/(?:README|Readme|readme)(?:\.md)?)?$/i);
  if (shortMatch && !shortPath.includes(' ')) {
    const code = shortMatch[1].toUpperCase();
    const mapped = findChapterByPrefix(domainId, code) ?? curriculum.shortIdIndex[code];
    if (mapped) {
      return { sitePath: `${mapped}${hashSuffix}`, external: false, broken: false };
    }
  }

  // Directory link: ./01-ENG/ or ../04-RET/
  const cleaned = rawPath.replace(/\/$/, '');
  let candidate = path.resolve(sourceDir, cleaned || '.');

  // If pointing at a directory, map domain/chapter folders to site pages first
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const relDir = normalizeFs(path.relative(docsRoot, candidate));
    const domain = curriculum.domains.find(
      (d) => d.folderName === relDir || d.id === relDir.toUpperCase() || d.slug === relDir.toLowerCase(),
    );
    if (domain) {
      return { sitePath: `${domain.href}${hashSuffix}`, external: false, broken: false };
    }
    const chapter = curriculum.domains
      .flatMap((d) => d.chapters.map((c) => ({ d, c })))
      .find(({ c }) => c.relativePath === relDir);
    if (chapter) {
      return { sitePath: `${chapter.c.href}${hashSuffix}`, external: false, broken: false };
    }
    const readme = resolveReadmeInDir(candidate);
    if (readme) candidate = readme;
  }

  // Missing .md extension
  if (!fs.existsSync(candidate) && fs.existsSync(`${candidate}.md`)) {
    candidate = `${candidate}.md`;
  }

  // Case-insensitive README fallback
  if (!fs.existsSync(candidate) && /readme\.md$/i.test(candidate)) {
    const dir = path.dirname(candidate);
    const readme = resolveReadmeInDir(dir);
    if (readme) candidate = readme;
  }

  if (!fs.existsSync(candidate)) {
    brokenLinks.push({
      source: sourceRelativePath,
      target: href,
      reason: 'target-not-found',
    });
    return { sitePath: null, external: false, broken: true };
  }

  const rel = normalizeFs(path.relative(docsRoot, candidate));
  const relParts = rel.split('/');

  // Domain-level README (e.g. AIF/readme.md) → domain hub page, not a fake chapter slug
  if (relParts.length === 2 && isReadmeFile(relParts[1])) {
    const domain = curriculum.domains.find(
      (d) =>
        d.folderName === relParts[0] ||
        d.id === relParts[0].toUpperCase() ||
        d.slug === relParts[0].toLowerCase(),
    );
    if (domain) {
      return { sitePath: `${domain.href}${hashSuffix}`, external: false, broken: false };
    }
  }

  // Map filesystem relative path to site href
  for (const domain of curriculum.domains) {
    for (const chapter of domain.chapters) {
      const docs = [...(chapter.readme ? [chapter.readme] : []), ...chapter.documents];
      for (const doc of docs) {
        if (doc.relativePath === rel) {
          return { sitePath: `${doc.href}${hashSuffix}`, external: false, broken: false };
        }
      }
      // Chapter folder match when linking to folder readme with different casing already handled
      if (chapter.relativePath === rel) {
        return { sitePath: `${chapter.href}${hashSuffix}`, external: false, broken: false };
      }
    }
  }

  // Synthesize from path parts as last resort
  const parts = relParts;
  if (parts.length >= 2) {
    const domainSlug = parts[0].toLowerCase();
    const chapterSlug = slugifySegment(parts[1]);
    if (parts.length === 2 && isReadmeFile(parts[1])) {
      return {
        sitePath: `/domains/${domainSlug}${hashSuffix}`,
        external: false,
        broken: false,
      };
    }
    if (parts.length === 2 || isReadmeFile(parts[parts.length - 1])) {
      return {
        sitePath: `/domains/${domainSlug}/${chapterSlug}${hashSuffix}`,
        external: false,
        broken: false,
      };
    }
    const docSlug = slugifySegment(parts[parts.length - 1].replace(/\.md$/i, ''));
    return {
      sitePath: `/domains/${domainSlug}/${chapterSlug}/${docSlug}${hashSuffix}`,
      external: false,
      broken: false,
    };
  }

  brokenLinks.push({
    source: sourceRelativePath,
    target: href,
    reason: 'unmapped-path',
  });
  return { sitePath: null, external: false, broken: true };
}
