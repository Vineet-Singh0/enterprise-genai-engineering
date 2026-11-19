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
    'completion check',
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

/** `1. Title` — numbered major sections (must stay in TOC). */
function isNumberedMajor(text: string): boolean {
  return /^\d+\.\s+\S/.test(text);
}

/** `3.1 Title` / `11.1 Title` — numbered structural subsections. */
function isNumberedSub(text: string): boolean {
  return /^\d+\.\d+(?:\.\d+)*\b/.test(text);
}

/** `Step 1: …` evaluation / procedure headings. */
function isStepHeading(text: string): boolean {
  return /^step\s*\d+/i.test(text);
}

/**
 * Repetitive instructional sequences — noisy as TOC destinations.
 * Mistake N, QN, Query A/B/C, bare Question N.
 */
function isRepetitiveMicroSequence(text: string): boolean {
  const t = normalize(text);
  if (/^mistake\s*\d+\b/i.test(t)) return true;
  if (/^queries?\s*[a-c]\b/i.test(t)) return true;
  if (/^q\d+\b/i.test(t)) return true;
  if (/^(question|answer|example|remember)\s*\d+\b/i.test(t)) return true;
  if (/^(q|a)\d*$/i.test(t)) return true;
  return false;
}

function isMicroHeading(text: string): boolean {
  const t = normalize(text);
  const lower = t.toLowerCase();
  if (TOC_KEEP.has(lower)) return false;
  if (isNumberedMajor(t) || isNumberedSub(t) || isStepHeading(t)) return false;
  if (isRepetitiveMicroSequence(t)) return true;
  if (TOC_MICRO.has(lower)) return true;
  if (t.length <= 3) return true;
  return false;
}

/**
 * H2/H3 navigation: keep numbered structure + meaningful titles;
 * drop repetitive Mistake/Q/Query micro-sequences.
 */
export function filterTocHeadings(headings: TocHeading[]): TocHeading[] {
  const primary = headings.filter((h) => {
    if (h.depth < 2 || h.depth > 3) return false;
    const t = normalize(h.text);
    const lower = t.toLowerCase();

    if (isRepetitiveMicroSequence(t)) return false;
    if (isMicroHeading(h.text)) return false;

    // Always keep numbered majors, N.M subs, and Step N procedure headings
    if (isNumberedMajor(t) || isNumberedSub(t) || isStepHeading(t)) return true;
    if (TOC_KEEP.has(lower)) return true;

    if (h.depth === 3) {
      // Descriptive H3: drop ultra-short labels only
      if (t.length < 12) return false;
      return true;
    }

    // H2: keep majors; drop very short non-keep labels
    if (t.length < 8) return false;
    return true;
  });

  // If still very long, prefer H2 + structural N.M / Step / keep-list H3
  const h2Count = primary.filter((h) => h.depth === 2).length;
  if (primary.length > 40 && h2Count >= 8) {
    return primary.filter((h) => {
      if (h.depth === 2) return true;
      const t = normalize(h.text);
      const lower = t.toLowerCase();
      return (
        isNumberedSub(t) ||
        isStepHeading(t) ||
        TOC_KEEP.has(lower)
      );
    });
  }

  return primary;
}
