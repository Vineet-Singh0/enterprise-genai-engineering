# Docs Domain Folder Order — Design

**Date:** 2026-11-17  
**Status:** Approved (Approach A)  
**Goal:** GitHub / Explorer pe `docs/` domain folders curriculum flow order mein dikhein, taaki koi repo se seedha padhe to sequence clear ho.

## Problem

Disk / GitHub alphabetical sort: `AGT`, `AIF`, `ENG`, `ENT`, `LLM`, `PROD`, `RET`.  
Curriculum flow (`DOMAIN_ORDER`): `ENG` → `AIF` → `LLM` → `RET` → `AGT` → `PROD` → `ENT`.

Site UI pehle se `DOMAIN_ORDER` use karti hai; sirf folder tree mismatch hai.

## Approach

**A — Numbered prefixes** (approved). Not B (readme-only guide) or C (long descriptive folder names).

## Folder mapping

| New folder   | Domain id |
|--------------|-----------|
| `01-ENG`     | ENG       |
| `02-AIF`     | AIF       |
| `03-LLM`     | LLM       |
| `04-RET`     | RET       |
| `05-AGT`     | AGT       |
| `06-PROD`    | PROD      |
| `07-ENT`     | ENT       |

Chapter folders (e.g. `ENG-01-Computer-Science-Fundamentals`) unchanged.

## Platform changes

- `scanDomain` in `learning-platform/src/lib/curriculum/scan.ts`: resolve domain folder by exact id **or** `NN-ID` / case-insensitive match ending with domain id (strip leading `\d+-`).
- Site slugs / URLs stay `/domains/eng/`, etc. — `DomainId` and `DOMAIN_ORDER` unchanged.
- Progress / localStorage keys unchanged (slug-based).

## Docs hygiene

- Update `docs/readme.md` tree diagram and any path examples to `01-ENG` style.
- Mechanical replace of literal path strings `docs/01-ENG/`, `docs/02-AIF/`, … → `docs/01-ENG/`, … inside markdown under `docs/` (and root readme if it hardcodes those paths).
- Do not rewrite teaching prose beyond path/string updates required by the rename.

## Out of scope

- Renaming chapter or lesson files  
- Changing learning-platform public URL scheme  
- Commit / push unless requested  

## Verification

1. `docs/` listing shows `01-ENG` … `07-ENT` in that order.  
2. Curriculum scan finds all seven domains with chapters non-empty.  
3. `astro build` succeeds; preview domain/chapter/doc pages still resolve.  
4. Grep for stale `docs/01-ENG/` (etc.) under repo (excluding history) is clean or only intentional legacy notes.

## Risks

- External bookmarks / PRs pointing at raw GitHub paths `docs/01-ENG/...` break — acceptable; prefixes are the fix for discovery.  
- Incomplete path string updates leave wrong references in a few MD files — mitigate with repo-wide grep after rename.
