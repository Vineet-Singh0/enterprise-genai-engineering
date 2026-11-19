/**
 * Math pipeline automated checks (no extra test framework).
 * Run: node scripts/test-math.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderMarkdown } from '../src/lib/curriculum/markdown.ts';
import { filterTocHeadings } from '../src/lib/curriculum/toc.ts';
import { mathPlainText, extractMathSegments } from '../src/lib/curriculum/math.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/math-sample.md'), 'utf8');

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

const { html, headings } = await renderMarkdown(fixture, 'fixtures/math-sample.md', 'RET', '/');
const toc = filterTocHeadings(headings.filter((h) => h.depth >= 2 && h.depth <= 3));

// 1–3: rendered katex present
assert.match(html, /class="katex"/, 'expected KaTeX output');
assert.match(html, /katex-display/, 'expected display math');

// 4: multi-line with leading = must NOT become a heading
assert.equal(
  headings.some((h) => /ANNRecall|fracacdfg|operatorname/i.test(h.text) || /ANNRecall|fracacdfg/i.test(h.id)),
  false,
  `fake math headings leaked into headings: ${JSON.stringify(headings, null, 2)}`,
);

// 5: math-containing heading → exactly one TOC entry, plain label
const complexity = toc.filter((h) => /complexity/i.test(h.text));
assert.equal(complexity.length, 1, `expected one Complexity TOC entry, got ${JSON.stringify(complexity)}`);
assert.match(complexity[0].text, /Complexity O\(Nd\)/i);
assert.doesNotMatch(complexity[0].text, /\\\\|katex|operatorname/i);

// 6: currency not converted
assert.match(html, /\$50 per month/);
assert.match(html, /\$50 to \$75/);
assert.match(html, /\$100/);
assert.equal((html.match(/\$50/g) || []).length >= 2, true);

// 7–8: fenced + inline code literal (not KaTeX-rendered)
const latexFence = html.match(/<div class="code-block">[\s\S]*?<\/div>/);
assert.ok(latexFence, 'expected a fenced code block');
assert.match(latexFence[0], /O\(Nd\)/);
assert.equal(latexFence[0].includes('class="katex"'), false);
assert.match(html, /<code[^>]*>[^<]*\\\(x\\\)[^<]*<\/code>|<code[^>]*>[^<]*\(x\)[^<]*<\/code>/);

// 9: mermaid untouched (math-looking text still in mermaid source, not KaTeX)
assert.match(html, /class="mermaid"/);
const mermaid = html.match(/<pre class="mermaid">[\s\S]*?<\/pre>/);
assert.ok(mermaid, 'expected mermaid block');
assert.equal(mermaid[0].includes('class="katex"'), false);
assert.match(mermaid[0], /k/);

// 10: escapes reach KaTeX (no raw TeX in visual prose; MathML annotation may keep TeX)
const withoutCode = html
  .replace(/<pre[\s\S]*?<\/pre>/g, '')
  .replace(/<code[\s\S]*?<\/code>/g, '')
  .replace(/<annotation[\s\S]*?<\/annotation>/g, '')
  .replace(/<span class="katex-mathml"[\s\S]*?<\/span>/g, '')
  .replace(/<span class="katex-html"[\s\S]*?<\/span>/g, '');
assert.equal(withoutCode.includes('\\operatorname'), false);
assert.equal(withoutCode.includes('\\frac'), false);
assert.equal(withoutCode.includes('\\('), false);
assert.equal(withoutCode.includes('\\['), false);
assert.match(html, /class="katex"/);

// 11: real heading before/after preserved
assert.ok(headings.some((h) => /Complexity/i.test(h.text)));

// 12: standalone display math creates no TOC entry
assert.equal(
  toc.some((h) => /^O\(Nd\)$/i.test(h.text.trim()) || /ANNRecall/i.test(h.text)),
  false,
  'standalone math must not create TOC entries',
);

// slug stability for known RET-06 style heading
const slugSource = '2. Why is \\(O(Nd)\\) not a complete latency model for exhaustive search?';
const plain = mathPlainText(slugSource);
const id = plain
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');
assert.equal(id, '2-why-is-ond-not-a-complete-latency-model-for-exhaustive-search');

// extraction skips code
const extracted = extractMathSegments('before `\\(x\\)` after \\(y\\)');
assert.equal(extracted.segments.length, 1);
assert.equal(extracted.segments[0].tex, 'y');

console.log('test-math: OK');
