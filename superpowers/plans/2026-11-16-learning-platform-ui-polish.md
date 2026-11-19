# Learning Platform UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Approach B UI polish so search, nav, reader, and progress feel daily-usable (~8–8.5) without editing curriculum markdown.

**Architecture:** Small, local changes to Astro layout/pages/components/CSS plus a `dev:search` npm script that builds Pagefind then previews. Progress ticks read/write the existing `localStorage` store.

**Tech Stack:** Astro 7, Pagefind, vanilla client scripts, CSS in `app.css`.

## Global Constraints

- Do not edit teaching content under `docs/**/*.md` (curriculum files).
- Do not commit or push unless the user asks.
- Keep base path helpers (`import.meta.env.BASE_URL` / `window.__EGE_BASE__`) intact.
- Prefer existing class names and tokens; extend `app.css` rather than new design systems.

---

### Task 1: Search workflow + honest empty state

**Files:**
- Modify: `learning-platform/package.json`
- Modify: `learning-platform/src/pages/search.astro`

- [ ] **Step 1: Add scripts**

In `package.json` `scripts`:

```json
"dev:search": "npm run build && astro preview",
"preview:search": "npm run build && astro preview"
```

Keep existing `dev`, `build`, `preview`.

- [ ] **Step 2: Harden Search page**

In `search.astro`, keep PagefindUI init, but:

1. Show a `#search-fallback` panel (hidden by default) with copy: search index is built on `npm run build`; use `npm run dev:search` for local indexed search.
2. On script `onerror` or missing `window.PagefindUI`, unhide fallback and hide/clear `#search`.
3. Optionally set a short timeout (~2s) after load attempt — if `#search` still empty of Pagefind UI, show fallback.

- [ ] **Step 3: Verify**

Run: `npm run build` then open `/search/` under preview — Pagefind UI appears.  
Under plain `astro dev`, open `/search/` — fallback message visible, no hard crash.

---

### Task 2: Header nav — desktop labels + mobile drawer

**Files:**
- Modify: `learning-platform/src/layouts/BaseLayout.astro`
- Modify: `learning-platform/src/styles/app.css`

- [ ] **Step 1: Markup**

In header, add:

```html
<button type="button" class="icon-btn mobile-nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">☰</button>
<nav class="nav-links" id="primary-nav" aria-label="Primary">…existing links…</nav>
```

Toggle sits before/after brand on small screens; theme button stays inside nav or header end.

- [ ] **Step 2: CSS**

- Default (≥861px): `.nav-links` flex row; `.nav-text` visible; `.mobile-nav-toggle { display: none }`.
- ≤860px: hide `.nav-links` off-canvas or as a dropdown panel; show toggle; when `body.nav-open` or `nav.is-open`, show full labeled links stacked.
- Do **not** hide `.nav-text` on mobile once drawer is open — labels must be readable.

- [ ] **Step 3: Script**

Toggle `aria-expanded`, class on `nav`/`body`, Escape closes, click outside closes.

- [ ] **Step 4: Verify**

Wide viewport: all labels visible. Narrow: hamburger opens labeled Home/Path/… .

---

### Task 3: Reader first-paint + sticky toolbar + notes collapse

**Files:**
- Modify: `learning-platform/src/pages/domains/[domain]/[chapter]/[doc].astro`
- Modify: `learning-platform/src/styles/app.css`

- [ ] **Step 1: DOM order / notes**

Wrap notes in:

```html
<details class="notes-box">
  <summary>Personal notes</summary>
  <textarea id="doc-notes" …></textarea>
</details>
```

Optionally wrap sidebar list in `<details class="chapter-files">` with summary “Chapter files” for mobile (open on desktop via CSS).

- [ ] **Step 2: CSS**

```css
@media (max-width: 860px) {
  .reader-main { order: -1; }
}
.doc-toolbar {
  position: sticky;
  top: var(--header-h);
  z-index: 5;
  background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0;
  margin-inline: -0.15rem;
}
```

Ensure breadcrumbs + toolbar remain at top of main column.

- [ ] **Step 3: Verify**

Mobile width: article content appears above chapter list. Toolbar sticks under header while scrolling prose.

---

### Task 4: Sidebar progress ticks

**Files:**
- Modify: `learning-platform/src/pages/domains/[domain]/[chapter]/[doc].astro` (add `data-href` on each side-list link)
- Modify: `learning-platform/src/components/ReaderClient.astro`
- Modify: `learning-platform/src/styles/app.css`

- [ ] **Step 1: data-href on links**

Each document link in sidebar:

```html
<a href={…} data-progress-href={item.href} …>
```

Use the same `href` shape stored in localStorage (curriculum `doc.href`).

- [ ] **Step 2: paintProgress()**

In ReaderClient:

```ts
function paintProgress() {
  const s = loadStore();
  document.querySelectorAll<HTMLAnchorElement>('[data-progress-href]').forEach((a) => {
    const key = a.dataset.progressHref!;
    const state = s.documents[key]?.state;
    a.dataset.state = state || '';
    a.classList.toggle('is-completed', state === 'completed');
    a.classList.toggle('is-in-progress', state === 'in_progress');
  });
}
```

Call on load and after `markCompleted`.

- [ ] **Step 3: CSS**

```css
.side-list a.is-completed::before { content: "✓ "; color: var(--accent); }
.side-list a.is-in-progress:not([aria-current="page"]) { /* subtle marker */ }
```

- [ ] **Step 4: Verify**

Mark completed → current (and matching) sidebar link shows ✓ without reload.

---

### Task 5: Home + Continue polish

**Files:**
- Modify: `learning-platform/src/pages/index.astro`
- Modify: `learning-platform/src/components/ContinueLearning.astro`
- Modify: `learning-platform/src/styles/app.css` (optional `.hero-panel.compact`)

- [ ] **Step 1: Compact hero**

Shorter supporting paragraph; slightly reduced padding via class `hero-panel compact` if useful.

- [ ] **Step 2: Continue CTA**

Ensure `#continue-btn` uses `btn btn-primary` and remains the dominant action in the card.

- [ ] **Step 3: Verify**

Home first screen: brand/title, Continue primary, path secondary — less repetition.

---

### Task 6: Path page structure

**Files:**
- Modify: `learning-platform/src/pages/path.astro`
- Modify: `learning-platform/src/styles/app.css`

- [ ] **Step 1: Sticky chips**

Above domain list:

```html
<nav class="path-steps" aria-label="Domain steps">
  {domains.map(... => <a href={`#step-${domain.slug}`}>{domain.id}</a>)}
</nav>
```

Sticky under header.

- [ ] **Step 2: details sections**

Each domain:

```html
<details class="panel path-domain" id={`step-${domain.slug}`} open={index === 0}>
  <summary>…</summary>
  <ol>…chapters…</ol>
</details>
```

- [ ] **Step 3: Verify**

Chips jump to sections; only first domain open by default.

---

### Task 7: Empty states + favicon

**Files:**
- Modify: `learning-platform/src/pages/bookmarks.astro`
- Modify: `learning-platform/src/pages/progress.astro`
- Modify: `learning-platform/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Bookmarks empty**

When empty, show muted text + `<a class="btn" href={path}>Browse learning path</a>`.

- [ ] **Step 2: Progress empty**

When no recent, CTA to Domains or Path.

- [ ] **Step 3: Favicon**

In `<head>`:

```html
<link rel="icon" href={`${base}favicon.svg`} type="image/svg+xml" />
<link rel="alternate icon" href={`${base}favicon.ico`} />
```

- [ ] **Step 4: Verify**

Empty bookmarks/progress show CTAs; tab icon loads.

---

### Task 8: Visual smoke check

- [ ] **Step 1:** `npm run dev` — home, path, one doc, bookmarks, progress, mobile nav.
- [ ] **Step 2:** `npm run build && npm run preview` — search Pagefind works.
- [ ] **Step 3:** Confirm no curriculum `docs/**/*.md` teaching files modified.
