# Reader Complete + Next — Design

**Date:** 2026-11-19  
**Status:** Approved (Approach A)

## Goal

Make Mark completed / Bookmark / Focus easier to notice, and make **Next** mark the current lesson completed before navigating.

## Behavior

- Top toolbar: Mark completed = primary; Bookmark + Focus = secondary.
- Next link click → `markCompleted(currentHref)` then navigate.
- Previous / sidebar / other links → no auto-complete.
- Existing Mark completed toggle remains for undo.

## Out of scope

Scroll-based complete, progress export, icon buttons.
