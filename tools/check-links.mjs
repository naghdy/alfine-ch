#!/usr/bin/env node
/**
 * Checks every internal link and asset reference in ./_site (run after build).
 * Verifies that target files exist and that #fragment anchors point to an id
 * on the target page. External links are listed but not fetched.
 *
 *   node tools/check-links.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../_site/', import.meta.url));
const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&');

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) htmlFiles.push(p);
  }
})(root);

const idsCache = new Map();
const idsIn = (file) => {
  if (!idsCache.has(file)) {
    idsCache.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
};

const resolveTarget = (path) => {
  const file = join(root, path);
  if (path.endsWith('/')) return join(file, 'index.html');
  if (existsSync(file) && statSync(file).isDirectory()) return join(file, 'index.html');
  return file;
};

let errors = 0;
const external = new Set();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(root, file).replace(/index\.html$/, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const ref = decode(m[1]);
    if (/^(mailto:|tel:)/.test(ref)) continue;
    if (/^https?:\/\//.test(ref)) {
      external.add(ref);
      continue;
    }
    const [pathAndQuery, fragment] = ref.split('#');
    const path = pathAndQuery.split('?')[0] || page;
    const target = resolveTarget(path);
    if (!existsSync(target)) {
      console.error(`✗ ${page}: missing ${ref}`);
      errors++;
    } else if (fragment && target.endsWith('.html') && !idsIn(target).has(fragment)) {
      console.error(`✗ ${page}: no #${fragment} on ${path}`);
      errors++;
    }
  }
}

console.log(`Checked ${htmlFiles.length} pages.`);
if (external.size) console.log(`External references (not fetched):\n  ${[...external].join('\n  ')}`);
if (errors) {
  console.error(`${errors} broken link(s).`);
  process.exit(1);
}
console.log('✓ No broken internal links.');
