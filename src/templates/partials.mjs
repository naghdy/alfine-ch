/**
 * Small, reusable markup helpers shared by every page.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const svgDir = new URL('../svg/', import.meta.url);
const readSvg = (name) => readFileSync(fileURLToPath(new URL(name, svgDir)), 'utf8').trim();

export const svg = {
  hero: readSvg('hero.svg'),
  wordmark: readSvg('wordmark.svg'),
  mark: readSvg('mark.svg'),
  dividers: [readSvg('divider-3.svg'), readSvg('divider-5.svg'), readSvg('divider-7.svg')],
};

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

/** A ridgeline divider whose fill (currentColor) matches the next section. */
export function divider(variant, toneClass) {
  const markup = svg.dividers[variant % svg.dividers.length];
  return `<div class="divider-wrap ${toneClass}">${markup}</div>`;
}

/** Brand lock-up: peak mark plus outlined wordmark. */
export function brand() {
  return `<span class="brand__mark">${svg.mark}</span><span class="brand__word">${svg.wordmark}</span>`;
}

/** EN | DE switcher that links to the equivalent page in the other language. */
export function langSwitch(ctx, landmark = true) {
  const items = ctx.languages
    .map((l) => {
      const current = l.lang === ctx.t.lang;
      const href = l.paths[ctx.page] ?? l.paths.home;
      return `<li><a href="${href}" hreflang="${l.lang}" lang="${l.lang}"${
        current ? ' aria-current="true"' : ''
      }><span aria-hidden="true">${l.langShort}</span><span class="visually-hidden">${esc(l.langName)}</span></a></li>`;
    })
    .join('');
  const label = esc(ctx.t.ui.languageLabel);
  // The header copy is a landmark; the footer copy is a plain labelled list,
  // so each page has only one "Language" navigation landmark.
  return landmark
    ? `<nav class="lang-switch" aria-label="${label}"><ul>${items}</ul></nav>`
    : `<div class="lang-switch lang-switch--footer"><span class="visually-hidden">${label}:</span><ul>${items}</ul></div>`;
}

/** In-page anchor: plain fragment on the homepage, full path elsewhere. */
export function anchor(ctx, id) {
  return ctx.page === 'home' ? `#${id}` : `${ctx.t.paths.home}#${id}`;
}

export function header(ctx) {
  const { t } = ctx;
  const links = t.nav.map((n) => `<li><a href="${anchor(ctx, n.id)}">${esc(n.label)}</a></li>`).join('');
  return `<a class="skip-link" href="#main">${esc(t.ui.skipLink)}</a>
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="${t.paths.home}" aria-label="${esc(t.ui.homeLabel)}">${brand()}</a>
    <nav class="site-nav" id="site-nav" aria-label="${esc(t.ui.mainNavLabel)}" data-nav>
      <ul class="site-nav__list">${links}</ul>
      <a class="button button--primary site-nav__cta" href="${anchor(ctx, 'contact')}">${esc(t.ui.contactButton)}</a>
    </nav>
    <div class="site-header__actions">
      ${langSwitch(ctx)}
      <a class="button button--outline-light button--small site-header__cta" href="${anchor(ctx, 'contact')}">${esc(
        t.ui.contactButton,
      )}</a>
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

export function footer(ctx) {
  const { t, site } = ctx;
  const links = t.nav.map((n) => `<li><a href="${anchor(ctx, n.id)}">${esc(n.label)}</a></li>`).join('');
  return `<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand">
      <a class="brand brand--footer" href="${t.paths.home}" aria-label="${esc(t.ui.homeLabel)}">${brand()}</a>
      <p class="site-footer__descriptor">${esc(t.ui.descriptor)}</p>
    </div>
    <nav class="site-footer__nav" aria-label="${esc(t.ui.footerNavLabel)}">
      <ul>${links}<li><a href="${anchor(ctx, 'contact')}">${esc(t.ui.contactButton)}</a></li></ul>
    </nav>
    <div class="site-footer__meta">
      <nav aria-label="${esc(t.ui.legalNavLabel)}">
        <ul class="site-footer__legal">
          <li><a href="${t.paths.impressum}">${esc(t.legal.impressum.heading)}</a></li>
          <li><a href="${t.paths.privacy}">${esc(t.legal.privacy.heading)}</a></li>
        </ul>
      </nav>
      ${langSwitch(ctx, false)}
    </div>
  </div>
  <div class="container site-footer__base">
    <p>© ${site.copyrightYear} ${esc(site.name)}. ${esc(t.ui.rights)}</p>
  </div>
</footer>`;
}
