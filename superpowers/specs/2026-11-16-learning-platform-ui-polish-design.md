# Learning Platform UI Polish — Design

**Date:** 2026-11-16  
**Status:** Approved (Approach B)  
**Constraint:** No edits to teaching content under `docs/**/*.md` (curriculum). Platform UI/code only.

## Goal

Raise the Astro personal learning platform from ~7.2/10 to ~8–8.5 by fixing daily-use search friction, navigation, reader first-paint, and progress clarity — without changing curriculum markdown.

## Approach

**B — Targeted CSS + small client scripts + npm script for search** (approved).

Not A (full redesign) or C (replace Pagefind with Fuse.js).

## Scope

### In scope (must + should)

1. **Search daily use** — `dev:search` / preview workflow; Search page empty state when Pagefind missing.
2. **Desktop + mobile nav** — labels visible on wide screens; hamburger drawer on ≤860px.
3. **Reader first paint** — main content first on mobile; sticky toolbar; chapter list collapsible on small screens.
4. **Sidebar progress** — completed ticks from localStorage; live update on Mark completed.
5. **Home density** — compact hero; stronger Continue primary CTA.
6. **Path page** — sticky step chips; domain sections as `<details>` (first open by default).
7. **Notes** — collapsible `<details>`, closed by default.
8. **Empty states** — Bookmarks / Progress CTAs to Path or Domains.
9. **Favicon** — link `favicon.svg` (and ico fallback) in `BaseLayout`.

### Out of scope

- Curriculum / teaching MD changes  
- Keyboard shortcuts, Mermaid theme re-render, GitHub Pages deploy QA (nice-to-have later)  
- Commit / PR / push unless requested  

## Architecture

Static Astro 7 site under `learning-platform/`. Progress in `localStorage` (`ege-learning-platform-v1`). Search via Pagefind post-`astro build`.

Changes stay in:

- `package.json` (scripts)
- `src/layouts/BaseLayout.astro`
- `src/pages/search.astro`, `index.astro`, `path.astro`, `bookmarks.astro`, `progress.astro`
- `src/pages/domains/[domain]/[chapter]/[doc].astro`
- `src/components/ReaderClient.astro`, `ContinueLearning.astro`
- `src/styles/app.css` (+ tokens if needed)

## Behaviour notes

- **Search:** Prefer documenting + scripting `build && preview` for indexed search. On Search UI, if `pagefind-ui.js` 404 or init fails, show a clear message (not a blank panel).
- **Nav:** Keep existing routes. Mobile drawer toggles `aria-expanded` / focus trap light (Escape closes). Theme toggle stays in header.
- **Reader:** CSS `order` so `.reader-main` precedes sidebar below 860px. Toolbar `position: sticky` under header. Sidebar progress uses pathname match against store `documents[href].state`.
- **Path:** Sticky chip row jumps to `#step-{domain}`; sections use `<details>` with step 1 `open`.

## Success criteria

- Desktop: full nav labels visible without hover-only tricks  
- Mobile: hamburger opens labeled links; reader shows content before chapter list  
- Mark completed → sidebar shows ✓ without reload  
- Search without index: honest empty state; with `npm run build` + preview: Pagefind works  
- Bookmarks/Progress empty: CTA present  
- Favicon loads (no missing icon in tab)

## Testing

- Manual: `astro dev` for layout/nav/reader/progress  
- Manual: `npm run build && npm run preview` for Pagefind  
- Spot-check home, path, one doc page, bookmarks, progress, search  
