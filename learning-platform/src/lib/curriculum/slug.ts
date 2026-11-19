/** Create stable URL slugs from filesystem names without renaming source files. */
export function slugifySegment(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–]/g, '-')
    .replace(/&/g, 'and')
    .replace(/[:/\\?<>|"*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function extractChapterCode(folderName: string): string {
  const match = folderName.match(/^([A-Za-z]+-\d+)/);
  return match ? match[1].toUpperCase().replace(/^ENG/i, 'ENG').replace(/^Eng/i, 'ENG') : folderName;
}

export function humanizeTitle(name: string): string {
  return name
    .replace(/\.md$/i, '')
    .replace(/^[A-Za-z]+-\d+[_\s:—-]+/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** UI-only title cleanup — does not edit teaching markdown. */
export function cleanDisplayTitle(title: string, chapterCode?: string): string {
  let t = title.replace(/\s+/g, ' ').trim();
  if (chapterCode) {
    t = t.replace(new RegExp(`^${chapterCode}\\s*[—–:\\-]\\s*`, 'i'), '');
  }
  t = t.replace(/^[A-Za-z]+-\d+\s*[—–:\\-]\s*/, '');
  // Drop leading lesson numbers: "01 —", "01:", "01."
  t = t.replace(/^\d{1,2}\s*[.:—–\-]\s*/, '');
  // Drop duplicated numeric prefixes left in H1s: "01 Computer ..."
  t = t.replace(/^\d{1,2}\s+/, '');
  return t.trim() || title.trim();
}

export function isReadmeFile(fileName: string): boolean {
  return /^readme(\.md)?$/i.test(fileName);
}

export function withBase(path: string, base: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (!path || path === '/') return `${normalizedBase}/`;
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}
