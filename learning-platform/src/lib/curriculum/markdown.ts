import { marked, type Tokens } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { codeToHtml } from 'shiki';
import { resolveMarkdownHref } from './links';
import type { DomainId } from './types';
import {
  extractMathSegments,
  headingPlainFromSource,
  renderMathSegments,
  restoreMathPlaceholders,
} from './math';

let pluginsReady = false;

function ensurePlugins(): void {
  if (pluginsReady) return;
  marked.use(gfmHeadingId());
  pluginsReady = true;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function highlightFence(lang: string, code: string): Promise<string> {
  const language = (lang || 'text').trim() || 'text';
  if (language === 'mermaid') {
    return `<div class="mermaid-block"><pre class="mermaid">${escapeHtml(code)}</pre></div>`;
  }

  try {
    const html = await codeToHtml(code, {
      lang: language === 'text' || language === 'plaintext' ? 'plaintext' : language,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
    return `<div class="code-block"><button type="button" class="copy-code" data-copy-code aria-label="Copy code">Copy</button>${html}</div>`;
  } catch {
    const html = await codeToHtml(code, {
      lang: 'plaintext',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
    return `<div class="code-block"><button type="button" class="copy-code" data-copy-code aria-label="Copy code">Copy</button>${html}</div>`;
  }
}

/** Pull fenced blocks out so marked never escapes Shiki HTML. */
function extractFences(source: string): { body: string; fences: Array<{ lang: string; code: string }> } {
  const fences: Array<{ lang: string; code: string }> = [];
  const body = source.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    const idx = fences.length;
    fences.push({ lang: (lang || '').trim(), code: code.replace(/\n$/, '') });
    return `\n\nEGEFENCE${idx}EGEFENCE\n\n`;
  });
  return { body, fences };
}

export interface RenderResult {
  html: string;
  headings: Array<{ depth: number; text: string; id: string }>;
}

export async function renderMarkdown(
  source: string,
  sourceRelativePath: string,
  domainId: DomainId,
  baseUrl: string,
): Promise<RenderResult> {
  ensurePlugins();

  const { body: fencedBody, fences } = extractFences(source);
  const { body, segments } = extractMathSegments(fencedBody);
  const highlighted = await Promise.all(fences.map((f) => highlightFence(f.lang, f.code)));
  const mathHtml = renderMathSegments(segments, sourceRelativePath);

  const headings: RenderResult['headings'] = [];
  const renderer = new marked.Renderer();

  renderer.link = ({ href, title, text }: Tokens.Link) => {
    const resolved = resolveMarkdownHref(href || '', sourceRelativePath, domainId);
    let finalHref = href || '';
    let cls = '';

    if (resolved.external) {
      finalHref = href || '';
    } else if (resolved.broken) {
      finalHref = '#';
      cls = ' class="broken-link"';
    } else if (resolved.sitePath?.startsWith('#')) {
      finalHref = resolved.sitePath;
    } else if (resolved.sitePath) {
      finalHref = resolved.sitePath.startsWith('/')
        ? `${baseUrl.replace(/\/$/, '')}${resolved.sitePath}`
        : resolved.sitePath;
    }

    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    const externalAttrs = resolved.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(finalHref)}"${titleAttr}${cls}${externalAttrs}>${text}</a>`;
  };

  renderer.heading = ({ text, depth }: Tokens.Heading) => {
    // Expand math placeholders back to delimiter form, then strip to plain TOC/slug text.
    // Do NOT derive labels from rendered KaTeX/MathML.
    const withMathSource = text.replace(/EGEMATH(\d+)EGEMATH/g, (_m, n: string) => {
      const seg = segments[Number(n)];
      if (!seg) return '';
      return seg.display ? `\\[${seg.tex}\\]` : `\\(${seg.tex}\\)`;
    });
    const plain = headingPlainFromSource(withMathSource);
    const id =
      plain
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || `heading-${headings.length}`;
    headings.push({ depth, text: plain, id });
    // Keep placeholder tokens in heading HTML so math restores inside the heading.
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  // Placeholders must stay literal — never treat as code.
  renderer.code = ({ text, lang }: Tokens.Code) => {
    const trimmed = text.trim();
    if (/^EGEFENCE\d+EGEFENCE$/.test(trimmed) || /^EGEMATH\d+EGEMATH$/.test(trimmed)) {
      return trimmed;
    }
    if (lang === 'mermaid') {
      return `<div class="mermaid-block"><pre class="mermaid">${escapeHtml(text)}</pre></div>`;
    }
    return `<pre><code class="language-${escapeHtml(lang || 'text')}">${escapeHtml(text)}</code></pre>`;
  };

  marked.setOptions({ renderer, gfm: true, breaks: false });
  let html = await marked.parse(body, { async: true });

  // marked may wrap placeholders in <p> — unwrap then substitute.
  html = html.replace(/<p>\s*(EGEFENCE\d+EGEFENCE)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(EGEMATH\d+EGEMATH)\s*<\/p>/g, '$1');
  html = restoreMathPlaceholders(html, mathHtml);
  html = html.replace(/EGEFENCE(\d+)EGEFENCE/g, (_m, n: string) => highlighted[Number(n)] ?? '');

  return { html, headings };
}
