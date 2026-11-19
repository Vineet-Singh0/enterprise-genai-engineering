# Learning Platform

Personal static learning interface for the Enterprise GenAI Engineering curriculum.

## Source of truth

Curriculum Markdown lives in `../docs/`. This app does not duplicate teaching content.

## Develop (WSL / Linux recommended)

```bash
cd learning-platform
npm install
npm run dev
```

Open the printed local URL. Use WSL or Linux for paths that contain characters invalid on Windows.

## Build

```bash
npm run build
npm run preview
```

Output is written to `dist/` and indexed with Pagefind for client-side search.

## GitHub Pages

Configured with `base: '/enterprise-genai-engineering'`. The workflow at `../.github/workflows/pages.yml` builds and deploys on push to `main`.

Enable **Settings → Pages → GitHub Actions** on the repository.

## Local personal data

Progress, bookmarks, theme, and scroll position are stored in `localStorage` only.
