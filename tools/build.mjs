#!/usr/bin/env node
/**
 * Static site build for alfine.ch. Uses only Node built-ins (Node 20+).
 *
 *   node tools/build.mjs        -> writes the site to ./_site
 *
 * Environment:
 *   FORMSPREE_FORM_ID  Formspree form ID for the contact form (optional
 *                      locally; set it as a repository variable for CI).
 *                      A local .env file is read if present.
 */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import site from '../src/content/site.mjs';
import en from '../src/content/en.mjs';
import de from '../src/content/de.mjs';
import { homePage, legalPage, notFoundPage } from '../src/templates/pages.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const out = join(root, '_site');
const languages = [en, de];

// Stylesheets and scripts are concatenated in this order into one file each.
const styles = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'sections.css'];
const scripts = ['header.js', 'reveal.js', 'parallax.js', 'contact-form.js'];

loadDotEnv(join(root, '.env'));

/* ---------------------------------------------------------------- helpers */

function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function write(relPath, content) {
  const file = join(out, relPath);
  // Tidy generated HTML: no trailing spaces, no runs of blank lines.
  if (relPath.endsWith('.html')) content = content.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const hash = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

/** Write a page path such as /de/impressum/ as /de/impressum/index.html. */
const pageFile = (path) => join(path, 'index.html');

/* ------------------------------------------------------------ form config */

function formConfig() {
  const id = (process.env.FORMSPREE_FORM_ID || '').trim();
  if (/^[A-Za-z0-9]{4,32}$/.test(id)) {
    return { action: `${site.formEndpointBase}${id}`, configured: true };
  }
  if (id) console.warn('! FORMSPREE_FORM_ID is not a valid form ID and was ignored.');
  console.warn('! Contact form not configured: set FORMSPREE_FORM_ID (see README).');
  // Fall back to a mailto: action so the form never posts to a dead endpoint.
  return { action: `mailto:${site.email}`, configured: false };
}

/* ------------------------------------------------------------------ build */

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Assets: CSS and JS bundles with a content hash for cache busting.
const css = styles.map((f) => readFileSync(join(src, 'styles', f), 'utf8')).join('\n');
const js = `'use strict';\n${scripts
  .map((f) => `/* ${f} */\n(() => {\n${readFileSync(join(src, 'scripts', f), 'utf8')}\n})();`)
  .join('\n\n')}\n`;
write('assets/css/site.css', css);
write('assets/js/site.js', js);
const assets = { css: `/assets/css/site.css?v=${hash(css)}`, js: `/assets/js/site.js?v=${hash(js)}` };

// Static assets (fonts, icons, images) and root files (CNAME, .nojekyll).
cpSync(join(src, 'assets'), join(out, 'assets'), { recursive: true });
cpSync(join(src, 'static'), out, { recursive: true });

// Language-specific map illustration.
const mapTemplate = readFileSync(join(src, 'svg', 'zug-map.svg'), 'utf8');
for (const t of languages) {
  write(`assets/images/zug-map-${t.lang}.svg`, mapTemplate.replace('{{lake}}', t.location.mapLake));
}

// Pages.
const form = formConfig();
for (const t of languages) {
  const base = { t, site, languages, assets, form };
  write(pageFile(t.paths.home), homePage({ ...base, page: 'home' }));
  write(pageFile(t.paths.impressum), legalPage({ ...base, page: 'impressum' }, 'impressum'));
  write(pageFile(t.paths.privacy), legalPage({ ...base, page: 'privacy' }, 'privacy'));
}
write('404.html', notFoundPage({ t: en, site, languages, assets, form, page: 'notFound' }, de));

// Sitemap with hreflang alternates for every page.
const pages = ['home', 'impressum', 'privacy'];
const urls = languages.flatMap((t) =>
  pages.map((p) => {
    const alts = languages
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${site.origin}${l.paths[p]}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site.origin}${en.paths[p]}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${site.origin}${t.paths[p]}</loc>\n${alts}\n  </url>`;
  }),
);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);

// Web app manifest.
write(
  'site.webmanifest',
  `${JSON.stringify(
    {
      name: site.name,
      short_name: site.name,
      description: en.orgDescription,
      lang: 'en',
      start_url: '/',
      display: 'browser',
      background_color: site.backgroundColor,
      theme_color: site.themeColor,
      icons: [
        { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/assets/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  )}\n`,
);

/* ------------------------------------------------------------- reporting */

// List every [PLACEHOLDER] still present in the content files.
const placeholders = new Set();
for (const f of readdirSync(join(src, 'content'))) {
  // Ignore comments, which describe the placeholder convention itself.
  const text = readFileSync(join(src, 'content', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of text.matchAll(/\[([A-Z][A-Z0-9 ,.'’\/-]{2,})\]/g)) placeholders.add(`[${m[1]}]`);
}
console.log(`✓ Built ${languages.length * pages.length + 1} pages into _site/`);
if (placeholders.size) {
  console.log(`! ${placeholders.size} placeholder(s) to fill in before launch:`);
  for (const p of placeholders) console.log(`    ${p}`);
}
