# Remove Personal Notes — Design

**Date:** 2026-11-17  
**Status:** Approved (Approach A)

## Goal

Remove the personal notes feature from the learning platform. Progress/bookmarks remain; users will not add in-app notes.

## Scope

**Remove:** lesson/chapter notes UI (`#doc-notes`), ReaderClient note save/load, Progress export/import notes panel, `saveNote` / `exportNotesJson` / `importNotesJson` and `notes` field from store, related CSS, copy that mentions personal notes backup.

**Keep:** curriculum “Reference notes” / TOC filters for heading words `note`/`notes`; progress, bookmarks, scroll, theme.

## Out of scope

Curriculum markdown changes; localStorage key rename (old `notes` data may linger harmlessly until store rewrite).
