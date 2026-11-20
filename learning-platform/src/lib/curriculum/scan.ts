import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOMAIN_META,
  DOMAIN_ORDER,
  type ChapterNode,
  type CurriculumGraph,
  type DocumentNode,
  type DomainId,
  type DomainNode,
} from './types';
import { cleanDisplayTitle, extractChapterCode, humanizeTitle, isReadmeFile, slugifySegment } from './slug';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getDocsRoot(): string {
  // learning-platform/src/lib/curriculum → repo root docs/
  return path.resolve(__dirname, '../../../../docs');
}

function listEntries(dir: string): fs.Dirent[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true });
}

function looksLikeMarkdown(filePath: string): boolean {
  if (/\.md$/i.test(filePath)) return true;
  try {
    const sample = fs.readFileSync(filePath, 'utf8').slice(0, 400);
    return /^#\s+/m.test(sample) || sample.includes('\n## ');
  } catch {
    return false;
  }
}

function titleFromMarkdown(filePath: string, fallback: string): string {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const match = text.match(/^#\s+(.+)$/m);
    if (match) return match[1].replace(/\s+/g, ' ').trim();
  } catch {
    /* ignore */
  }
  return humanizeTitle(fallback);
}

/** Letters/digits only, with "&" read as "and", for comparing a title to a folder name. */
function comparableTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '');
}

function teachingOrder(fileName: string): number {
  const match = fileName.match(/^(\d+)/);
  return match ? Number(match[1]) : 999;
}

function buildDocument(
  absPath: string,
  relativePath: string,
  domainSlug: string,
  chapterSlug: string,
  baseHref: string,
): DocumentNode {
  const fileName = path.basename(absPath);
  const stem = fileName.replace(/\.md$/i, '');
  const slug = isReadmeFile(fileName) ? 'readme' : slugifySegment(stem);
  const href = isReadmeFile(fileName)
    ? `${baseHref}/${chapterSlug}`
    : `${baseHref}/${chapterSlug}/${slug}`;

  return {
    id: `${domainSlug}/${chapterSlug}/${slug}`,
    title: titleFromMarkdown(absPath, stem),
    fileName,
    relativePath: relativePath.replace(/\\/g, '/'),
    slug,
    href,
    isReadme: isReadmeFile(fileName),
    order: isReadmeFile(fileName) ? -1 : teachingOrder(fileName),
  };
}

function scanChapter(
  domainId: DomainId,
  domainSlug: string,
  chapterDir: string,
  chapterFolder: string,
  docsRoot: string,
): ChapterNode {
  const relativePath = path.relative(docsRoot, chapterDir).replace(/\\/g, '/');
  const code = extractChapterCode(chapterFolder);
  const chapterSlug = slugifySegment(chapterFolder);
  const baseHref = `/domains/${domainSlug}`;
  const href = `${baseHref}/${chapterSlug}`;

  const files = listEntries(chapterDir)
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => looksLikeMarkdown(path.join(chapterDir, name)));

  const documents: DocumentNode[] = [];
  let readme: DocumentNode | undefined;

  for (const fileName of files) {
    const abs = path.join(chapterDir, fileName);
    const rel = path.join(relativePath, fileName).replace(/\\/g, '/');
    const doc = buildDocument(abs, rel, domainSlug, chapterSlug, baseHref);
    if (doc.isReadme) readme = doc;
    else documents.push(doc);
  }

  documents.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const titleFromFolder = chapterFolder
    .replace(/^[A-Za-z]+-\d+[_\s:—-]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Prefer folder-derived chapter titles. README H1 is often meta ("Documentation Plan"),
  // so it is only used to restore punctuation (commas, "&") when it names the same words.
  const readmeTitle = readme?.title
    .replace(/^[A-Za-z]+-\d+(?:\.\d+)?\s*[—–:-]+\s*/, '')
    .trim();
  const sameWords = (a: string, b: string) => comparableTitle(a) === comparableTitle(b);
  const chapterTitle =
    readmeTitle && titleFromFolder && sameWords(readmeTitle, titleFromFolder)
      ? readmeTitle
      : titleFromFolder;

  return {
    id: `${domainId}/${code}`,
    code,
    title: chapterTitle || code,
    folderName: chapterFolder,
    relativePath,
    slug: chapterSlug,
    href,
    readme,
    documents,
  };
}

function domainFolderMatches(folderName: string, domainId: DomainId): boolean {
  const upper = folderName.toUpperCase();
  if (upper === domainId) return true;
  // Numbered flow prefixes: 01-ENG → ENG (GitHub/Explorer order)
  const stripped = upper.replace(/^\d+-/, '');
  return stripped === domainId;
}

function scanDomain(domainId: DomainId, docsRoot: string): DomainNode {
  const candidates = listEntries(docsRoot).filter(
    (e) => e.isDirectory() && domainFolderMatches(e.name, domainId),
  );
  // Prefer numbered prefix when both bare and NN-ID exist
  const folderName =
    candidates.find((e) => /^\d+-/i.test(e.name))?.name ?? candidates[0]?.name;

  if (!folderName) {
    return {
      id: domainId,
      name: DOMAIN_META[domainId].name,
      folderName: domainId,
      slug: domainId.toLowerCase(),
      href: `/domains/${domainId.toLowerCase()}`,
      description: DOMAIN_META[domainId].description,
      chapters: [],
    };
  }

  const domainDir = path.join(docsRoot, folderName);
  const slug = domainId.toLowerCase();
  const chapters = listEntries(domainDir)
    .filter((e) => e.isDirectory())
    .map((e) => scanChapter(domainId, slug, path.join(domainDir, e.name), e.name, docsRoot))
    .sort((a, b) => {
      const na = Number(a.code.match(/-(\d+)/)?.[1] ?? 999);
      const nb = Number(b.code.match(/-(\d+)/)?.[1] ?? 999);
      return na - nb || a.code.localeCompare(b.code);
    });

  return {
    id: domainId,
    name: DOMAIN_META[domainId].name,
    folderName,
    slug,
    href: `/domains/${slug}`,
    description: DOMAIN_META[domainId].description,
    chapters,
  };
}

let cached: CurriculumGraph | null = null;

export function getCurriculum(): CurriculumGraph {
  if (cached) return cached;

  const docsRoot = getDocsRoot();
  const domains = DOMAIN_ORDER.map((id) => scanDomain(id, docsRoot));
  const documentsByHref: CurriculumGraph['documentsByHref'] = {};
  const shortIdIndex: Record<string, string> = {};

  for (const domain of domains) {
    for (const chapter of domain.chapters) {
      shortIdIndex[chapter.code.toUpperCase()] = chapter.href;
      shortIdIndex[chapter.code.toLowerCase()] = chapter.href;

      const allDocs = [...(chapter.readme ? [chapter.readme] : []), ...chapter.documents];
      for (const doc of allDocs) {
        documentsByHref[doc.href] = {
          ...doc,
          domainId: domain.id,
          chapterSlug: chapter.slug,
        };
      }
    }
  }

  cached = { domains, documentsByHref, shortIdIndex };

  const chapterCount = domains.reduce((s, d) => s + d.chapters.length, 0);
  const docCount = domains.reduce(
    (s, d) => s + d.chapters.reduce((cs, ch) => cs + ch.documents.length, 0),
    0,
  );
  console.log(
    `[curriculum] domains=${domains.length} chapters=${chapterCount} teachingDocs=${docCount}`,
  );

  return cached;
}

export function getDomain(slug: string): DomainNode | undefined {
  return getCurriculum().domains.find((d) => d.slug === slug.toLowerCase());
}

export function getChapter(domainSlug: string, chapterSlug: string): ChapterNode | undefined {
  return getDomain(domainSlug)?.chapters.find((c) => c.slug === chapterSlug);
}

export function getLinearDocuments(): Array<{
  domainId: DomainId;
  domainSlug: string;
  chapter: ChapterNode;
  doc: DocumentNode;
}> {
  const out: Array<{
    domainId: DomainId;
    domainSlug: string;
    chapter: ChapterNode;
    doc: DocumentNode;
  }> = [];

  for (const domain of getCurriculum().domains) {
    for (const chapter of domain.chapters) {
      const sequence = [...(chapter.readme ? [chapter.readme] : []), ...chapter.documents];
      for (const doc of sequence) {
        out.push({ domainId: domain.id, domainSlug: domain.slug, chapter, doc });
      }
    }
  }
  return out;
}

export function getAdjacent(href: string): { prev?: string; next?: string; prevTitle?: string; nextTitle?: string } {
  const linear = getLinearDocuments();
  const idx = linear.findIndex((item) => item.doc.href === href);
  if (idx < 0) return {};
  const prev = linear[idx - 1];
  const next = linear[idx + 1];
  return {
    prev: prev?.doc.href,
    next: next?.doc.href,
    prevTitle: prev ? cleanDisplayTitle(prev.doc.title, prev.chapter.code) : undefined,
    nextTitle: next ? cleanDisplayTitle(next.doc.title, next.chapter.code) : undefined,
  };
}

export function readDocSource(relativePath: string): string {
  return fs.readFileSync(path.join(getDocsRoot(), relativePath), 'utf8');
}
