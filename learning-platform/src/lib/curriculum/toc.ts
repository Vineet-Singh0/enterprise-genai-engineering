/** Pedagogical micro-labels — not useful as standalone TOC destinations. */
const TOC_MICRO = new Set(
  [
    'question',
    'questions',
    'remember',
    'answer',
    'answers',
    'example',
    'examples',
    'think',
    'think about it',
    'analogy',
    'note',
    'notes',
    'tip',
    'warning',
    'quick check',
    'key idea',
    'key ideas',
    'real example',
    'real-world examples',
    'simple explanation',
    'beginner misconception',
    'why',
    'what',
    'how',
    'estimated reading time',
  ].map((s) => s.toLowerCase()),
);

/** Major section titles that should stay even if short. */
const TOC_KEEP = new Set(
  [
    'introduction',
    'why this exists',
    'mental model',
    'core concepts',
    'internal working',
    'practical example',
    'practical examples',
    'production perspective',
    'engineering decisions',
    'common mistakes',
    'interview questions',
    'quick revision',
    'key takeaways',
    'further reading',
    'prerequisites',
    'learning objectives',
    'before we start',
    'summary',
    'overview',
  ].map((s) => s.toLowerCase()),
);

export interface TocHeading {
  depth: number;
  text: string;
  id: string;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isMicroHeading(text: string): boolean {
  const t = normalize(text);
  const lower = t.toLowerCase();
  if (TOC_KEEP.has(lower)) return false;
  if (TOC_MICRO.has(lower)) return true;
  if (t.length <= 3) return true;
  if (/^(q|a)\d*$/i.test(t)) return true;
  if (/^(question|answer|example|remember)\s*\d*$/i.test(t)) return true;
  return false;
}

/**
 * Major H2/H3 navigation only. Stricter H3 rules; collapse to H2-heavy
 * when the list would still be very long.
 */
export function filterTocHeadings(headings: TocHeading[]): TocHeading[] {
  const primary = headings.filter((h) => {
    if (h.depth < 2 || h.depth > 3) return false;
    if (isMicroHeading(h.text)) return false;
    const t = normalize(h.text);
    const lower = t.toLowerCase();

    // Procedural step / numbered markers — useful in prose, noisy in TOC
    if (/^step\s*\d+/i.test(t)) return false;
    if (/^\d+\.\s/.test(t)) return false;

    if (h.depth === 3) {
      if (TOC_KEEP.has(lower)) return true;
      if (t.length < 18) return false;
      return true;
    }

    // H2: keep majors; drop very short non-keep labels
    if (!TOC_KEEP.has(lower) && t.length < 8) return false;
    return true;
  });

  const h2Count = primary.filter((h) => h.depth === 2).length;
  if (primary.length > 36 && h2Count >= 8) {
    return primary.filter(
      (h) => h.depth === 2 || TOC_KEEP.has(normalize(h.text).toLowerCase()),
    );
  }

  return primary;
}
