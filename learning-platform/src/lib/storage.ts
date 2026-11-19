export type ProgressState = 'not_started' | 'in_progress' | 'completed';

export interface StudyMeta {
  title: string;
  domainId?: string;
  domainName?: string;
  chapterCode?: string;
  chapterTitle?: string;
}

export interface DocumentProgress extends StudyMeta {
  state: ProgressState;
  scroll?: number;
  updatedAt: string;
}

export interface BookmarkEntry extends StudyMeta {
  href: string;
  addedAt: string;
}

export interface CurrentStudy extends StudyMeta {
  href: string;
  updatedAt: string;
}

export interface ProgressStore {
  version: 1;
  documents: Record<string, DocumentProgress>;
  currentHref?: string;
  currentStudy?: CurrentStudy;
  recent: string[];
  bookmarks: BookmarkEntry[];
  theme?: 'light' | 'dark';
  focusMode?: boolean;
}

const KEY = 'ege-learning-platform-v1';

export function emptyStore(): ProgressStore {
  return {
    version: 1,
    documents: {},
    recent: [],
    bookmarks: [],
  };
}

export function loadStore(): ProgressStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProgressStore;
    if (parsed.version !== 1) return emptyStore();
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: ProgressStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function mergeMeta(
  existing: Partial<DocumentProgress> | undefined,
  meta?: StudyMeta,
): StudyMeta {
  return {
    title: meta?.title || existing?.title || '',
    domainId: meta?.domainId || existing?.domainId,
    domainName: meta?.domainName || existing?.domainName,
    chapterCode: meta?.chapterCode || existing?.chapterCode,
    chapterTitle: meta?.chapterTitle || existing?.chapterTitle,
  };
}

function setCurrentStudy(store: ProgressStore, href: string, meta?: StudyMeta): void {
  const merged = mergeMeta(store.documents[href], meta);
  store.currentHref = href;
  store.currentStudy = {
    href,
    title: merged.title || href.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || href,
    domainId: merged.domainId,
    domainName: merged.domainName,
    chapterCode: merged.chapterCode,
    chapterTitle: merged.chapterTitle,
    updatedAt: new Date().toISOString(),
  };
  store.recent = [href, ...store.recent.filter((h) => h !== href)].slice(0, 20);
}

export function markInProgress(href: string, meta?: StudyMeta): ProgressStore {
  const store = loadStore();
  const existing = store.documents[href];
  const merged = mergeMeta(existing, meta);
  if (!existing || existing.state === 'not_started') {
    store.documents[href] = {
      ...merged,
      state: 'in_progress',
      scroll: existing?.scroll,
      updatedAt: new Date().toISOString(),
    };
  } else {
    store.documents[href] = {
      ...existing,
      ...merged,
      title: merged.title || existing.title,
      updatedAt: new Date().toISOString(),
    };
  }
  setCurrentStudy(store, href, meta);
  saveStore(store);
  return store;
}

export function markCompleted(href: string, meta?: StudyMeta): ProgressStore {
  const store = loadStore();
  const existing = store.documents[href];
  const merged = mergeMeta(existing, meta);
  store.documents[href] = {
    ...existing,
    ...merged,
    state: 'completed',
    scroll: existing?.scroll,
    title: merged.title || existing?.title || '',
    updatedAt: new Date().toISOString(),
  };
  setCurrentStudy(store, href, meta);
  saveStore(store);
  return store;
}

/** Toggle completed ↔ in_progress for clearer progress UX. */
export function toggleCompleted(href: string, meta?: StudyMeta): ProgressStore {
  const store = loadStore();
  const done = store.documents[href]?.state === 'completed';
  if (done) {
    const existing = store.documents[href];
    const merged = mergeMeta(existing, meta);
    store.documents[href] = {
      ...existing,
      ...merged,
      state: 'in_progress',
      scroll: existing?.scroll,
      title: merged.title || existing?.title || '',
      updatedAt: new Date().toISOString(),
    };
    setCurrentStudy(store, href, meta);
    saveStore(store);
    return store;
  }
  return markCompleted(href, meta);
}

export function saveScroll(href: string, scroll: number): void {
  const store = loadStore();
  const existing = store.documents[href] ?? {
    state: 'in_progress' as ProgressState,
    title: '',
    updatedAt: new Date().toISOString(),
  };
  store.documents[href] = { ...existing, scroll, updatedAt: new Date().toISOString() };
  saveStore(store);
}

export function toggleBookmark(href: string, title: string, meta?: StudyMeta): ProgressStore {
  const store = loadStore();
  const idx = store.bookmarks.findIndex((b) => b.href === href);
  if (idx >= 0) store.bookmarks.splice(idx, 1);
  else {
    const merged = mergeMeta(store.documents[href], { ...meta, title: meta?.title || title });
    store.bookmarks.unshift({
      href,
      title: merged.title || title,
      domainId: merged.domainId,
      domainName: merged.domainName,
      chapterCode: merged.chapterCode,
      chapterTitle: merged.chapterTitle,
      addedAt: new Date().toISOString(),
    });
  }
  saveStore(store);
  return store;
}

