/** Astro BASE_URL may omit the trailing slash; normalize for safe joins. */
export function getBase(): string {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/** Join site base with a path that may start with `/`. */
export function withBase(path: string): string {
  const base = getBase().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
