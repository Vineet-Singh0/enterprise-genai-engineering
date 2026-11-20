#!/usr/bin/env node
// Fails the build if any rendered page contains an unresolved curriculum link.
// Unresolved links are rendered as <span class="broken-link" title="Unresolved link: ...">.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, '..', 'dist');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = await walk(distDir).catch(() => {
  console.error(`check-links: dist directory not found at ${distDir}. Run the build first.`);
  process.exit(1);
});

const re = /<span class="broken-link" title="([^"]*)">/g;
// Dead placeholder anchors, e.g. markdown `[Title](#)`, render as <a href="#">.
const deadAnchor = /<a\b[^>]*\shref="#"[^>]*>/g;
const hits = [];
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const page = path.relative(distDir, file).replace(/\\/g, '/');
  for (const m of html.matchAll(re)) hits.push({ page, title: m[1] });
  for (const m of html.matchAll(deadAnchor)) hits.push({ page, title: `dead anchor ${m[0]}` });
}

if (hits.length) {
  console.error(`check-links: ${hits.length} unresolved link(s) found:`);
  for (const h of hits.slice(0, 50)) console.error(`  - ${h.page}: ${h.title}`);
  if (hits.length > 50) console.error(`  ... and ${hits.length - 50} more`);
  process.exit(1);
}

console.log(`check-links: OK (${files.length} pages, 0 unresolved links)`);
