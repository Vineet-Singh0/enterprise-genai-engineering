/**
 * Presentation-only lesson HTML transforms.
 * Does not edit source Markdown.
 *
 * - Strip repository/file metadata chrome
 * - Normalize heading hierarchy (first H1 kept; later H1 → H2)
 */

export interface LessonHeading {
  depth: number;
  text: string;
  id: string;
}

function isRepoMetaBlockquote(inner: string): boolean {
  const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const hasDomain = /\bDomain\s*:/i.test(text);
  // "Module:" or "Module ID:" (common in curriculum READMEs)
  const hasModule = /\bModule(?:\s+ID)?\s*:/i.test(text);
  const hasDocument = /\bDocument\s*:/i.test(text);
  const hasLocation = /\bLocation\s*:/i.test(text);
  const hasRepository = /\bRepository\s*:/i.test(text);
  const score =
    Number(hasDomain) +
    Number(hasModule) +
    Number(hasDocument) +
    Number(hasLocation) +
    Number(hasRepository);
  if (score >= 2) return true;
  if (hasDocument && /\.md\b/i.test(text)) return true;
  return false;
}

export function stripLeadingRepoMeta(html: string): string {
  let out = html.trimStart();

  out = out.replace(/<p>\s*File:\s*<code>[^<]+<\/code>\s*<\/p>\s*/gi, '');

  // Remove repo meta callouts first (before any inner <p> surgery).
  out = out.replace(/<blockquote>([\s\S]*?)<\/blockquote>\s*/gi, (full, inner: string) => {
    return isRepoMetaBlockquote(inner) ? '' : full;
  });

  // Only strip top-level Domain chrome paragraphs — not inside kept blockquotes.
  out = out.replace(/(^|<\/(?:h1|h2|h3|hr)>)\s*<p>\s*<strong>Domain:<\/strong>[\s\S]*?<\/p>\s*/gi, '$1');

  // Leftover empty blockquotes render as a lone blue accent bar.
  out = out.replace(/<blockquote>\s*<\/blockquote>\s*/gi, '');

  return out;
}

/**
 * First meaningful H1 stays H1; every later H1 becomes H2.
 * Headings array depths are updated to match so TOC stays consistent.
 */
export function normalizeLessonHeadings(
  html: string,
  headings: LessonHeading[],
): { html: string; headings: LessonHeading[] } {
  let seenHtmlH1 = false;
  const outHtml = html.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, (full, attrs: string | undefined, inner: string) => {
    if (!seenHtmlH1) {
      seenHtmlH1 = true;
      return full;
    }
    return `<h2${attrs ?? ''}>${inner}</h2>`;
  });

  let seenHeadingH1 = false;
  const outHeadings = headings.map((h) => {
    if (h.depth !== 1) return h;
    if (!seenHeadingH1) {
      seenHeadingH1 = true;
      return h;
    }
    return { ...h, depth: 2 };
  });

  return { html: outHtml, headings: outHeadings };
}

/** Strip repo meta, then normalize H1s — single entry for reader pages. */
export function prepareLessonContent(
  html: string,
  headings: LessonHeading[],
): { html: string; headings: LessonHeading[] } {
  return normalizeLessonHeadings(stripLeadingRepoMeta(html), headings);
}
