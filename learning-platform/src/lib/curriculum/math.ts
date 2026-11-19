/**
 * Protect math from Markdown parsing, then render with KaTeX at build time.
 *
 * Extraction runs after fenced-code placeholders are already in place, and
 * skips inline code / fence placeholders so literal math in code stays literal.
 */

import katex from 'katex';

export type MathSegment = {
  tex: string;
  display: boolean;
  placeholder: string;
};

export type MathExtractResult = {
  body: string;
  segments: MathSegment[];
};

export class KatexRenderError extends Error {
  filePath: string;
  snippet: string;
  causeMessage: string;

  constructor(filePath: string, snippet: string, causeMessage: string) {
    super(`[KaTeX] ${filePath}: ${causeMessage}\n  snippet: ${snippet}`);
    this.name = 'KatexRenderError';
    this.filePath = filePath;
    this.snippet = snippet;
    this.causeMessage = causeMessage;
  }
}

const PLACEHOLDER_RE = /EGEMATH(\d+)EGEMATH/g;

/** Strip math delimiters to a readable plain-text form (TOC / slugs). */
export function mathPlainText(source: string): string {
  let out = source;
  out = out.replace(/\\\(([\s\S]*?)\\\)/g, (_m, tex: string) => simplifyTex(tex));
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (_m, tex: string) => simplifyTex(tex));
  out = out.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex: string) => simplifyTex(tex));
  out = out.replace(/(?<![\\$])\$(?![\s$])([^$\n]+?)(?<![\\\s])\$(?!\d)/g, (_m, tex: string) =>
    simplifyTex(tex),
  );
  return out.replace(/\s+/g, ' ').trim();
}

function simplifyTex(tex: string): string {
  return tex
    .replace(/\\operatorname\*?\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\\|/g, '||')
    .replace(/\\([{}])/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract math from Markdown source that already has fence placeholders.
 * Skips inline `code` and EGEFENCE placeholders.
 */
export function extractMathSegments(source: string): MathExtractResult {
  const segments: MathSegment[] = [];
  const protectedSpans = findProtectedSpans(source);

  type Hit = { start: number; end: number; tex: string; display: boolean };
  const hits: Hit[] = [];

  const pushIfFree = (start: number, end: number, tex: string, display: boolean) => {
    if (overlapsProtected(start, end, protectedSpans)) return;
    hits.push({ start, end, tex, display });
  };

  // Display $$ ... $$
  for (const m of source.matchAll(/\$\$([\s\S]*?)\$\$/g)) {
    if (m.index === undefined) continue;
    pushIfFree(m.index, m.index + m[0].length, m[1], true);
  }

  // Display \[ ... \]
  for (const m of source.matchAll(/\\\[([\s\S]*?)\\\]/g)) {
    if (m.index === undefined) continue;
    pushIfFree(m.index, m.index + m[0].length, m[1], true);
  }

  // Inline \( ... \)
  for (const m of source.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
    if (m.index === undefined) continue;
    pushIfFree(m.index, m.index + m[0].length, m[1], false);
  }

  // Inline $...$ with currency false-positive rules
  for (const m of source.matchAll(/(?<![\\$])\$(?![\s$])([^$\n]+?)(?<![\\\s])\$(?!\d)/g)) {
    if (m.index === undefined) continue;
    // Skip if already inside a $$ hit
    pushIfFree(m.index, m.index + m[0].length, m[1], false);
  }

  hits.sort((a, b) => a.start - b.start);
  // Drop overlapping hits (keep earlier / longer)
  const filtered: Hit[] = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.start < lastEnd) continue;
    filtered.push(h);
    lastEnd = h.end;
  }

  let body = '';
  let cursor = 0;
  for (const h of filtered) {
    body += source.slice(cursor, h.start);
    const placeholder = `EGEMATH${segments.length}EGEMATH`;
    segments.push({ tex: h.tex, display: h.display, placeholder });
    body += placeholder;
    cursor = h.end;
  }
  body += source.slice(cursor);

  return { body, segments };
}

function findProtectedSpans(source: string): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  for (const m of source.matchAll(/EGEFENCE\d+EGEFENCE/g)) {
    if (m.index === undefined) continue;
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  for (const m of source.matchAll(/`[^`\n]+`/g)) {
    if (m.index === undefined) continue;
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  return spans;
}

function overlapsProtected(
  start: number,
  end: number,
  spans: Array<{ start: number; end: number }>,
): boolean {
  return spans.some((s) => start < s.end && end > s.start);
}

function decorateKatexHtml(html: string): string {
  return html
    .replace(/class="katex-html"/g, 'class="katex-html" data-pagefind-ignore')
    .replace(
      /<annotation encoding="application\/x-tex">/g,
      '<annotation encoding="application/x-tex" data-pagefind-ignore>',
    );
}

export function renderMathSegments(
  segments: MathSegment[],
  filePath: string,
): string[] {
  return segments.map((seg) => {
    try {
      const rendered = katex.renderToString(seg.tex, {
        displayMode: seg.display,
        throwOnError: true,
        strict: 'ignore',
        output: 'htmlAndMathml',
      });
      const decorated = decorateKatexHtml(rendered);
      if (seg.display) {
        return `<div class="ege-math-display">${decorated}</div>`;
      }
      return decorated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const snippet = seg.tex.trim().slice(0, 160);
      console.error(`[KaTeX] ${filePath}: ${msg}\n  snippet: ${snippet}`);
      throw new KatexRenderError(filePath, snippet, msg);
    }
  });
}

export function restoreMathPlaceholders(html: string, rendered: string[]): string {
  return html.replace(PLACEHOLDER_RE, (_m, n: string) => rendered[Number(n)] ?? '');
}

/** Heading text for TOC/slug: source-derived, math → plain text. */
export function headingPlainFromSource(rawHeadingText: string): string {
  // marked may pass HTML-ish text; strip tags first then math
  const noTags = rawHeadingText.replace(/<[^>]+>/g, '');
  // Placeholders should not appear in headings; if they do, leave them
  return mathPlainText(noTags);
}
