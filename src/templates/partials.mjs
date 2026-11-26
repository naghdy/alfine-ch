/**
 * Small, reusable markup helpers.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ridgeEdgePath } from './terrain.mjs';

const svgDir = new URL('../svg/', import.meta.url);
const readSvg = (name) => readFileSync(fileURLToPath(new URL(name, svgDir)), 'utf8').trim();

export const svg = {
  wordmark: readSvg('wordmark.svg'),
  mark: readSvg('mark.svg'),
  contours: readSvg('contours.svg'),
};

const edgePath = ridgeEdgePath();

/** Escape text for safe use in HTML content and attribute values. */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Encode every character as a numeric entity (light obfuscation for scrapers). */
const entities = (value) => [...value].map((c) => `&#${c.codePointAt(0)};`).join('');

/**
 * Email link. The address is written as HTML entities, so it renders, reads
 * aloud and works as a normal link without JavaScript, but is not visible as
 * plain text to simple harvesting bots.
 */
export function emailLink(address, className = '') {
  const cls = className ? ` class="${className}"` : '';
  return `<a${cls} href="${entities(`mailto:${address}`)}">${entities(address)}</a>`;
}

/** Escape a copy string, then expand the {email} token. */
export function rich(text, ctx) {
  return esc(text).replace(/\{email\}/g, emailLink(ctx.site.email));
}

/** The Zugerberg's own outline, used as the top edge of each content sheet. */
export function ridgeEdge(flip = false) {
  return `<svg class="sheet__edge${flip ? ' sheet__edge--flip' : ''}" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${edgePath}"/></svg>`;
}

/** Brand lock-up: peak mark plus outlined wordmark. */
export function brand() {
  return `<span class="brand__mark">${svg.mark}</span><span class="brand__word">${svg.wordmark}</span>`;
}

/** EN | DE switcher. */
export function langSwitch(ctx, landmark = true) {
  const items = ctx.languages
    .map((l) => {
      const current = l.lang === ctx.t.lang;
      return `<li><a href="${l.paths.home}" hreflang="${l.lang}" lang="${l.lang}" data-lang-link${
        current ? ' aria-current="true"' : ''
      }><span aria-hidden="true">${l.langShort}</span><span class="visually-hidden">${esc(l.langName)}</span></a></li>`;
    })
    .join('');
  const label = esc(ctx.t.ui.languageLabel);
  // The header copy is a landmark; the footer copy is a plain labelled list,
  // so the page has only one "Language" navigation landmark.
  return landmark
    ? `<nav class="lang-switch" aria-label="${label}"><ul>${items}</ul></nav>`
    : `<div class="lang-switch lang-switch--footer"><span class="visually-hidden">${label}:</span><ul>${items}</ul></div>`;
}

/** In-page anchor: plain fragment on the page itself, full path elsewhere (404). */
export function anchor(ctx, id) {
  return ctx.page === 'home' ? `#${id}` : `${ctx.t.paths.home}#${id}`;
}

export function header(ctx) {
  const { t } = ctx;
  const links = t.nav.map((n) => `<li><a href="${anchor(ctx, n.id)}" data-nav-link>${esc(n.label)}</a></li>`).join('');
  return `<a class="skip-link" href="#main">${esc(t.ui.skipLink)}</a>
<header class="masthead" data-header>
  <div class="masthead__inner">
    <a class="brand" href="${ctx.page === 'home' ? '#top' : t.paths.home}" aria-label="${esc(t.ui.homeLabel)}">${brand()}</a>
    <nav class="masthead__nav" id="site-nav" aria-label="${esc(t.ui.mainNavLabel)}" data-nav>
      <ul>${links}</ul>
      <a class="masthead__contact" href="${anchor(ctx, 'contact')}" data-nav-link>${esc(t.ui.contactButton)}</a>
    </nav>
    <div class="masthead__actions">
      ${langSwitch(ctx)}
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle data-label-open="${esc(
        t.ui.menuOpen,
      )}" data-label-close="${esc(t.ui.menuClose)}">
        <span class="menu-toggle__bars" aria-hidden="true"></span>
        <span class="visually-hidden" data-menu-label>${esc(t.ui.menuOpen)}</span>
      </button>
    </div>
  </div>
</header>`;
}

function legalDoc(ctx, key, id) {
  const doc = ctx.t.legal[key];
  const sections = doc.sections
    .map(
      (s) => `<section class="legal__section">
            <h3>${esc(s.heading)}</h3>
            ${s.address ? `<address>${s.address.map(esc).join('<br>')}</address>` : ''}
            ${s.body ? s.body.map((p) => `<p>${rich(p, ctx)}</p>`).join('\n') : ''}
          </section>`,
    )
    .join('\n');
  return `<details class="legal" id="${id}" data-legal>
        <summary class="legal__summary"><span class="legal__title">${esc(doc.heading)}</span><span class="legal__sub">${esc(
          doc.subheading,
        )}</span><span class="legal__icon" aria-hidden="true"></span></summary>
        <div class="legal__body">
          <h2 class="legal__heading">${esc(doc.heading)}</h2>
          ${sections}
        </div>
      </details>`;
}

export function footer(ctx) {
  const { t, site } = ctx;
  const links = t.nav.map((n) => `<li><a href="${anchor(ctx, n.id)}">${esc(n.label)}</a></li>`).join('');
  const home = ctx.page === 'home';
  return `<footer class="act act--window finale" id="footer" data-hours="21 23" data-ink="light">
  <div class="finale__inner">
    <div class="finale__brand" data-reveal>
      <p class="finale__word" aria-hidden="true">${svg.wordmark}</p>
      <p class="finale__descriptor">${esc(t.ui.descriptor)}</p>
      <p class="finale__email">${emailLink(site.email)}</p>
    </div>
    <div class="finale__row">
      <nav class="finale__nav" aria-label="${esc(t.ui.footerNavLabel)}">
        <ul>${links}<li><a href="${anchor(ctx, 'contact')}">${esc(t.ui.contactButton)}</a></li></ul>
      </nav>
      ${langSwitch(ctx, false)}
    </div>
    ${
      home
        ? `<div class="finale__legal" aria-label="${esc(t.ui.legalNavLabel)}" role="group">
      ${legalDoc(ctx, 'impressum', 'impressum')}
      ${legalDoc(ctx, 'privacy', 'privacy')}
    </div>`
        : ''
    }
    <div class="finale__base">
      <p>© ${site.copyrightYear} ${esc(site.name)}. ${esc(t.ui.rights)}</p>
      <p><a href="${home ? '#top' : t.paths.home}">${esc(home ? t.ui.backToTop : t.ui.backToHome)}</a></p>
    </div>
  </div>
</footer>`;
}
