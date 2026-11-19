# Docs Domain Folder Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `docs/{ENG,…}` to `docs/{01-ENG,…}` so GitHub/Explorer show curriculum flow order, while site URLs stay `/domains/eng/`.

**Architecture:** Numbered domain folder prefixes; update `scanDomain` to resolve `NN-ID` or exact `ID`; mechanical path-string updates in markdown; rebuild/verify.

**Tech Stack:** Node/Astro curriculum scanner (`scan.ts`), git `mv`, markdown under `docs/`.

## Global Constraints

- Mapping: `01-ENG` … `07-ENT` per approved design.
- Do not rename chapter/lesson folders.
- Public URLs / `DomainId` / `DOMAIN_ORDER` unchanged.
- No commit/push unless user requests.

---

### Task 1: Scanner accepts numbered domain folders

**Files:**
- Modify: `learning-platform/src/lib/curriculum/scan.ts` (`scanDomain` folder lookup ~lines 130–134)

**Interfaces:**
- Consumes: `DomainId`, `listEntries(docsRoot)`
- Produces: `folderName` matching exact `domainId` OR `/^\d+-/i` + `domainId` (case-insensitive)

- [ ] **Step 1:** Change folder match from `e.name.toUpperCase() === domainId` to also accept names whose uppercase form equals `domainId` after stripping a leading `NN-` prefix (e.g. `01-ENG` → `ENG`).
- [ ] **Step 2:** Sanity: helper or inline — prefer folders that match; if both bare and prefixed exist, prefer prefixed `NN-` form.
- [ ] **Step 3:** No separate unit test harness required; verify in Task 3 via scan/build.

---

### Task 2: Rename domain folders + path strings

**Files:**
- Rename: `docs/ENG` → `docs/01-ENG`, `AIF`→`02-AIF`, `LLM`→`03-LLM`, `RET`→`04-RET`, `AGT`→`05-AGT`, `PROD`→`06-PROD`, `ENT`→`07-ENT`
- Modify: `docs/readme.md` tree
- Modify: any `docs/**/*.md` (and root `readme.md` if needed) with literal `docs/01-ENG/` … paths

- [ ] **Step 1:** `git mv` (or filesystem rename) each domain folder to numbered name.
- [ ] **Step 2:** Update `docs/readme.md` organization tree to numbered folders.
- [ ] **Step 3:** Repo-wide replace `docs/01-ENG/`→`docs/01-ENG/` … for all seven domains (markdown path references only).
- [ ] **Step 4:** Grep for remaining bare `docs/(ENG|AIF|LLM|RET|AGT|PROD|ENT)/` under the repo (exclude `dist/`, `node_modules/`).

---

### Task 3: Build + verify

**Files:**
- None (verify only)

- [ ] **Step 1:** Confirm `ls docs` order is `01-ENG` … `07-ENT`.
- [ ] **Step 2:** From `learning-platform`, run `npm run build` (or equivalent) — expect exit 0 and all domains present.
- [ ] **Step 3:** Optional: curl preview domain index if preview already running.

---

## Self-review

- Spec coverage: rename, scanner, readme, path strings, verify — yes.
- No chapter renames; no URL changes — yes.
- Commit steps omitted per user git policy unless later requested.
