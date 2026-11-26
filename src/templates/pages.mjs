/**
 * Page bodies: the single page (one per language) and the 404 page.
 *
 * The page alternates two kinds of "act":
 *  - windows (act--window): transparent, so the view south from Zug behind the
 *    page shows through, with one short line of text;
 *  - sheets (act--sheet): paper panels with the detailed copy, whose top edge
 *    is the outline of the range (Rigi, the Alps, Pilatus).
 * Every act carries data-hours: the hours of the day the scene moves through
 * while that act is in view.
 */
import { anchor, emailLink, esc, rich, ridgeEdge, svg } from './partials.mjs';
import { layout } from './layout.mjs';

// Line drawings for the two areas of focus (decorative, drawn in on scroll).
const workIcons = [
  // Property: a roofline resting on a ridge.
  `<svg class="focus__icon" viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"><path pathLength="1" d="M2 44h60"/><path pathLength="1" d="M14 44V22L30 10l16 12v22"/><path pathLength="1" d="M24 44V31h12v13"/><path pathLength="1" d="M46 20l5-5 11 11"/></g></svg>`,
  // Investments: growth rings, an image of patience.
  `<svg class="focus__icon" viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.2"><path pathLength="1" d="M5 24a27 20 0 1 0 54 0a27 20 0 1 0 -54 0"/><path pathLength="1" d="M14 24.5a19 14 0 1 0 38 0a19 14 0 1 0 -38 0"/><path pathLength="1" d="M23 25a11 8 0 1 0 22 0a11 8 0 1 0 -22 0"/><path pathLength="1" d="M30.5 25.5a4 3 0 1 0 8 0a4 3 0 1 0 -8 0"/></g></svg>`,
];

const num = (i) => String(i).padStart(2, '0');

function paragraphs(list, ctx, cls = '') {
  return list.map((p) => `<p${cls ? ` class="${cls}"` : ''}>${rich(p, ctx)}</p>`).join('\n');
}

function head({ eyebrow, heading, intro }, id, n) {
  return `<p class="eyebrow"><span class="eyebrow__num">${num(n)}</span>${esc(eyebrow)}</p>
          <h2 class="title" id="${id}-title" data-split>${esc(heading)}</h2>
          ${intro ? `<p class="intro">${esc(intro)}</p>` : ''}`;
}

function sheet(id, hours, inner, { tone = 'paper', flip = false } = {}) {
  return `<section class="act act--sheet sheet--${tone}" id="${id}" aria-labelledby="${id}-title" data-hours="${hours}">
        ${ridgeEdge(flip)}
        <div class="sheet__inner">
          ${inner}
        </div>
      </section>`;
}

function hero(ctx) {
  const h = ctx.t.hero;
  return `<section class="act act--window hero" id="top" aria-labelledby="hero-title" data-hours="5.3 7.2" data-ink="light">
        <div class="hero__inner">
          <p class="hero__word" aria-hidden="true">${svg.wordmark}</p>
          <p class="eyebrow eyebrow--plain">${esc(h.eyebrow)}</p>
          <h1 class="hero__title" id="hero-title" data-split>${esc(h.heading)}</h1>
          <p class="hero__lead">${esc(h.lead)}</p>
          <div class="hero__actions">
            <a class="button button--brass" href="#contact">${esc(h.primaryCta)}</a>
            <a class="button button--line" href="#about">${esc(h.secondaryCta)}</a>
          </div>
        </div>
        <p class="hero__coords" aria-hidden="true">47° 10′ N · 8° 31′ E</p>
        <span class="hero__cue" aria-hidden="true"></span>
      </section>`;
}

function interlude(text, hours, ink) {
  return `<div class="act act--window interlude" data-hours="${hours}" data-ink="${ink}">
        <p class="interlude__text" data-split>${esc(text)}</p>
      </div>`;
}

function about(ctx) {
  const a = ctx.t.about;
  const pillars = a.pillars
    .map(
      (p) => `<li class="pillar" data-reveal>
              <h3 class="pillar__title">${esc(p.title)}</h3>
              <p>${esc(p.text)}</p>
            </li>`,
    )
    .join('');
  return sheet(
    'about',
    '7.2 8.2',
    `<div class="grid">
            <div class="grid__head">${head(a, 'about', 1)}</div>
            <div class="grid__body prose" data-reveal>${paragraphs(a.paragraphs, ctx)}</div>
          </div>
          <ul class="pillars">${pillars}</ul>`,
  );
}

function work(ctx) {
  const w = ctx.t.work;
  const items = w.cards
    .map(
      (c, i) => `<article class="focus" data-reveal>
              <span class="focus__num" aria-hidden="true">${i === 0 ? 'I' : 'II'}</span>
              ${workIcons[i]}
              <h3 class="focus__title">${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
            </article>`,
    )
    .join('');
  return sheet(
    'what-we-do',
    '9.8 11.6',
    `<div class="grid">
            <div class="grid__head">${head(w, 'what-we-do', 2)}</div>
          </div>
          <div class="focus-pair">${items}</div>
          <p class="aside" data-reveal>${esc(w.note)} <a class="text-link" href="#contact">${esc(w.noteCta)}</a></p>`,
    { flip: true },
  );
}

function principles(ctx) {
  const p = ctx.t.principles;
  const items = p.items
    .map(
      (item, i) => `<li class="principle" data-reveal>
              <span class="principle__num" aria-hidden="true">${num(i + 1)}</span>
              <h3 class="principle__title">${esc(item.title)}</h3>
              <p>${esc(item.text)}</p>
            </li>`,
    )
    .join('');
  return sheet(
    'principles',
    '13.4 15.4',
    `<figure class="topo" data-topo>
            ${svg.contours}
            <figcaption class="topo__caption">${esc(p.mapCaption)}</figcaption>
          </figure>
          <div class="grid">
            <div class="grid__head">${head(p, 'principles', 3)}</div>
          </div>
          <ol class="principles">${items}</ol>`,
    { tone: 'night' },
  );
}

function trust(ctx) {
  const tr = ctx.t.trust;
  const items = tr.items
    .map(
      (item) => `<li class="trust__item" data-reveal>
              <h3 class="trust__title">${esc(item.title)}</h3>
              <p>${esc(item.text)}</p>
            </li>`,
    )
    .join('');
  return sheet(
    'trust',
    '15.4 18.9',
    `<div class="grid">
            <div class="grid__head">${head(tr, 'trust', 4)}</div>
            <ul class="grid__body trust">${items}</ul>
          </div>`,
    { flip: true },
  );
}

function location(ctx) {
  const l = ctx.t.location;
  const facts = l.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('');
  const labels = Object.entries(l.labels)
    .map(([key, value]) => `<li data-scene-label="${key}">${esc(value)}</li>`)
    .join('');
  return `<section class="act act--window place" id="location" aria-labelledby="location-title" data-hours="18.9 20.5" data-ink="light">
        <div class="place__intro">
          <div class="place__text">
            ${head(l, 'location', 5)}
            <div class="prose" data-reveal>${paragraphs(l.paragraphs, ctx)}</div>
            <dl class="facts" data-reveal>${facts}</dl>
            <p class="visually-hidden">${esc(l.labelsIntro)}</p>
            <ul class="visually-hidden">${labels}</ul>
          </div>
        </div>
        <div class="place__stage" data-scene-stage aria-hidden="true"></div>
      </section>`;
}

function contactForm(ctx) {
  const { t, form } = ctx;
  const f = t.contact.form;
  const field = (id, label, control, { optional = false } = {}) => `<div class="field">
                <label class="field__label" for="cf-${id}">${esc(label)}${
                  optional ? ` <span class="field__optional">(${esc(f.optional)})</span>` : ''
                }</label>
                ${control}
                ${
                  optional
                    ? ''
                    : `<p class="field__error" id="cf-${id}-error" data-error-for="${id}" hidden>${esc(f.errors[id])}</p>`
                }
              </div>`;
  return `<div class="form-card" data-reveal>
            <h3 class="form-card__title" id="form-title">${esc(f.heading)}</h3>
            <form class="contact-form" action="${esc(form.action)}" method="POST" accept-charset="UTF-8" aria-labelledby="form-title" data-contact-form data-configured="${form.configured}" data-default-subject="${esc(
              f.emailSubject,
            )}" data-sending-label="${esc(f.sending)}">
              <p class="form-alert" data-form-alert hidden role="alert">${esc(f.errors.summary)}</p>
              ${field('name', f.name, '<input id="cf-name" name="name" type="text" autocomplete="name" required maxlength="120">')}
              ${field('email', f.email, '<input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="200">')}
              ${field('subject', f.subject, '<input id="cf-subject" name="subject" type="text" maxlength="160">', { optional: true })}
              ${field('message', f.message, '<textarea id="cf-message" name="message" rows="5" required maxlength="5000"></textarea>')}
              <div class="hp" aria-hidden="true">
                <label for="cf-website">${esc(f.honeypot)}</label>
                <input id="cf-website" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
              </div>
              <input type="hidden" name="language" value="${t.lang}">
              <p class="form-note">${esc(f.privacyNote)} <a class="text-link" href="#privacy" data-legal-link>${esc(
                f.privacyLinkText,
              )}</a>.</p>
              <button class="button button--ink button--block" type="submit" data-submit>${esc(f.submit)}</button>
              <p class="form-alert form-alert--error" data-form-error hidden role="alert">${esc(f.errorText)} ${emailLink(
                ctx.site.email,
              )}.</p>
            </form>
            <div class="form-success" data-form-success hidden tabindex="-1" role="status">
              <p class="form-success__title">${esc(f.successTitle)}</p>
              <p>${esc(f.successText)}</p>
            </div>
          </div>`;
}

function contact(ctx) {
  const c = ctx.t.contact;
  return sheet(
    'contact',
    '20.5 21',
    `<div class="grid grid--contact">
            <div class="grid__head">
              ${head(c, 'contact', 6)}
              <p class="contact-email">${emailLink(ctx.site.email)}</p>
              <dl class="contact-details">
                <div><dt>${esc(c.locationLabel)}</dt><dd>${esc(c.locationValue)}</dd></div>
                <div><dt>${esc(c.postalLabel)}</dt><dd><address>${c.postalLines.map(esc).join('<br>')}</address></dd></div>
              </dl>
            </div>
            ${contactForm(ctx)}
          </div>`,
  );
}

export function homePage(ctx) {
  const t = ctx.t;
  const pillarsLine = t.about.pillars.map((p) => `${p.title}.`).join(' ');
  const body = [
    hero(ctx),
    about(ctx),
    interlude(pillarsLine, '8.2 9.8', 'light'),
    work(ctx),
    interlude(t.principles.items[0].text, '11.6 13.4', 'light'),
    principles(ctx),
    trust(ctx),
    location(ctx),
    contact(ctx),
  ]
    .map((s) => `      ${s}`)
    .join('\n');
  return layout(ctx, { body, bodyClass: 'page-home' });
}

/** One bilingual 404 page (GitHub Pages serves a single /404.html). */
export function notFoundPage(ctx, other) {
  const block = (t, level) => `<div class="lost__block" lang="${t.lang}">
            <h${level} class="lost__title">${esc(t.notFound.heading)}</h${level}>
            <p>${esc(t.notFound.text)}</p>
            <p><a class="button button--line" href="${t.paths.home}">${esc(t.ui.backToHome)}</a></p>
          </div>`;
  const body = `      <section class="act act--window lost" data-hours="21.5 22.5" data-ink="light" aria-labelledby="lost-title">
        <div class="lost__inner">
          ${block(ctx.t, 1).replace('class="lost__title"', 'class="lost__title" id="lost-title"')}
          ${block(other, 2)}
        </div>
      </section>`;
  return layout(ctx, { body, bodyClass: 'page-404', indexable: false });
}

export { anchor };
