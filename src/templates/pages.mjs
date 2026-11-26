/**
 * Page bodies: the single-page home flow, the legal pages and the 404 page.
 */
import { esc, rich, divider, emailLink, svg } from './partials.mjs';
import { layout } from './layout.mjs';

// Small line illustrations for the two focus cards (decorative).
const cardIcons = [
  // Property: a roofline resting on a ridge.
  `<svg class="card__icon" viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M14 40V22L30 10l16 12v18"/><path d="M24 40V29h12v11"/><path d="M2 44h60"/><path d="M46 20l5-5 11 11" opacity=".55"/></g></svg>`,
  // Investments: growth rings, a quiet image of patience.
  `<svg class="card__icon" viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="32" cy="24" rx="27" ry="20"/><ellipse cx="33" cy="24.5" rx="19" ry="14" opacity=".8"/><ellipse cx="34" cy="25" rx="11" ry="8" opacity=".6"/><ellipse cx="34.5" cy="25.5" rx="4" ry="3" opacity=".45"/></g></svg>`,
];

function paragraphs(list, ctx, cls = '') {
  return list.map((p) => `<p${cls ? ` class="${cls}"` : ''}>${rich(p, ctx)}</p>`).join('\n');
}

function sectionHead({ eyebrow, heading, id, intro }, tone = '') {
  return `<p class="eyebrow ${tone}">${esc(eyebrow)}</p>
        <h2 class="section-title" id="${id}-title">${esc(heading)}</h2>
        ${intro ? `<p class="section-intro">${esc(intro)}</p>` : ''}`;
}

function hero(ctx) {
  const { hero: h } = ctx.t;
  return `<section class="hero" aria-labelledby="hero-title" data-hero>
        <div class="hero__media">${svg.hero}</div>
        <div class="container hero__content">
          <p class="eyebrow eyebrow--light">${esc(h.eyebrow)}</p>
          <h1 class="hero__title" id="hero-title">${esc(h.heading)}</h1>
          <p class="hero__lead">${esc(h.lead)}</p>
          <div class="button-row">
            <a class="button button--primary" href="#contact">${esc(h.primaryCta)}</a>
            <a class="button button--ghost-light" href="#about">${esc(h.secondaryCta)}</a>
          </div>
        </div>
        ${divider(0, 'divider-wrap--to-stone')}
      </section>`;
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
  return `<section class="section section--stone" id="about" aria-labelledby="about-title">
        <div class="container split">
          <div class="split__head" data-reveal>
            ${sectionHead({ ...a, id: 'about' })}
          </div>
          <div class="prose" data-reveal>
            ${paragraphs(a.paragraphs, ctx)}
          </div>
        </div>
        <div class="container">
          <ul class="pillars">${pillars}</ul>
        </div>
      </section>`;
}

function work(ctx) {
  const w = ctx.t.work;
  const cards = w.cards
    .map(
      (c, i) => `<article class="card" data-reveal>
            ${cardIcons[i]}
            <h3 class="card__title">${esc(c.title)}</h3>
            <p>${esc(c.text)}</p>
          </article>`,
    )
    .join('');
  return `<section class="section section--mist" id="what-we-do" aria-labelledby="what-we-do-title">
        <div class="container">
          <div class="section-head" data-reveal>
            ${sectionHead({ ...w, id: 'what-we-do' })}
          </div>
          <div class="cards">${cards}</div>
          <p class="aside-note" data-reveal>${esc(w.note)} <a class="text-link" href="#contact">${esc(w.noteCta)}</a></p>
        </div>
        ${divider(1, 'divider-wrap--to-navy')}
      </section>`;
}

function principles(ctx) {
  const p = ctx.t.principles;
  const items = p.items
    .map(
      (item, i) => `<li class="principle" data-reveal>
            <span class="principle__number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="principle__title">${esc(item.title)}</h3>
            <p>${esc(item.text)}</p>
          </li>`,
    )
    .join('');
  return `<section class="section section--navy" id="principles" aria-labelledby="principles-title">
        <div class="container">
          <div class="section-head" data-reveal>
            ${sectionHead({ ...p, id: 'principles' }, 'eyebrow--light')}
          </div>
          <ol class="principles">${items}</ol>
        </div>
        ${divider(2, 'divider-wrap--to-stone')}
      </section>`;
}

function trust(ctx) {
  const tr = ctx.t.trust;
  const items = tr.items
    .map(
      (item) => `<li class="trust-item" data-reveal>
            <h3 class="trust-item__title">${esc(item.title)}</h3>
            <p>${esc(item.text)}</p>
          </li>`,
    )
    .join('');
  return `<section class="section section--stone" id="trust" aria-labelledby="trust-title">
        <div class="container split">
          <div class="split__head" data-reveal>
            ${sectionHead({ ...tr, id: 'trust' })}
          </div>
          <ul class="trust-list">${items}</ul>
        </div>
        ${divider(0, 'divider-wrap--to-navy')}
      </section>`;
}

function location(ctx) {
  const l = ctx.t.location;
  const facts = l.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('');
  return `<section class="section section--navy" id="location" aria-labelledby="location-title">
        <div class="container split split--media">
          <div data-reveal>
            ${sectionHead({ ...l, id: 'location' }, 'eyebrow--light')}
            <div class="prose prose--light">${paragraphs(l.paragraphs, ctx)}</div>
            <dl class="facts">${facts}</dl>
          </div>
          <figure class="map-panel" data-reveal>
            <img src="/assets/images/zug-map-${ctx.t.lang}.svg" width="640" height="560" loading="lazy" decoding="async" alt="${esc(
              l.mapAlt,
            )}">
          </figure>
        </div>
        ${divider(1, 'divider-wrap--to-stone')}
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
            ${field('message', f.message, '<textarea id="cf-message" name="message" rows="6" required maxlength="5000"></textarea>')}
            <div class="hp" aria-hidden="true">
              <label for="cf-website">${esc(f.honeypot)}</label>
              <input id="cf-website" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
            </div>
            <input type="hidden" name="language" value="${t.lang}">
            <p class="form-note">${esc(f.privacyNote)} <a class="text-link" href="${t.paths.privacy}">${esc(
              f.privacyLinkText,
            )}</a>.</p>
            <button class="button button--primary button--block" type="submit" data-submit>${esc(f.submit)}</button>
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
  return `<section class="section section--stone" id="contact" aria-labelledby="contact-title">
        <div class="container split split--contact">
          <div data-reveal>
            ${sectionHead({ ...c, id: 'contact' })}
            <dl class="contact-details">
              <div><dt>${esc(c.emailLabel)}</dt><dd>${emailLink(ctx.site.email, 'text-link')}</dd></div>
              <div><dt>${esc(c.locationLabel)}</dt><dd>${esc(c.locationValue)}</dd></div>
              <div><dt>${esc(c.postalLabel)}</dt><dd><address>${c.postalLines.map(esc).join('<br>')}</address></dd></div>
            </dl>
          </div>
          ${contactForm(ctx)}
        </div>
        ${divider(2, 'divider-wrap--to-navy')}
      </section>`;
}

export function homePage(ctx) {
  const body = [hero, about, work, principles, trust, location, contact].map((s) => `      ${s(ctx)}`).join('\n');
  return layout(ctx, { body, bodyClass: 'page-home' });
}

export function legalPage(ctx, key) {
  const doc = ctx.t.legal[key];
  const sections = doc.sections
    .map(
      (s) => `<section class="legal__section">
            <h2>${esc(s.heading)}</h2>
            ${s.address ? `<address>${s.address.map(esc).join('<br>')}</address>` : ''}
            ${s.body ? paragraphs(s.body, ctx) : ''}
          </section>`,
    )
    .join('\n');
  const body = `      <div class="page-hero">
        <div class="container">
          <h1 class="page-hero__title">${esc(doc.heading)}</h1>
          <p class="page-hero__sub">${esc(doc.subheading)}</p>
        </div>
        ${divider(1, 'divider-wrap--to-stone')}
      </div>
      <article class="section section--stone legal">
        <div class="container container--narrow prose">
          ${sections}
          <p class="legal__back"><a class="text-link" href="${ctx.t.paths.home}">${esc(ctx.t.ui.backToHome)}</a></p>
        </div>
      </article>`;
  return layout(ctx, { body, bodyClass: 'page-legal' });
}

/** One bilingual 404 page (GitHub Pages serves a single /404.html). */
export function notFoundPage(ctx, other) {
  const block = (t) => `<div class="not-found__block" lang="${t.lang}">
            <h${t === ctx.t ? '1' : '2'} class="page-hero__title">${esc(t.notFound.heading)}</h${t === ctx.t ? '1' : '2'}>
            <p class="page-hero__sub">${esc(t.notFound.text)}</p>
            <p><a class="button button--ghost-light" href="${t.paths.home}">${esc(t.ui.backToHome)}</a></p>
          </div>`;
  const body = `      <div class="page-hero page-hero--full">
        <div class="container not-found">
          ${block(ctx.t)}
          ${block(other)}
        </div>
        ${divider(0, 'divider-wrap--to-navy')}
      </div>`;
  return layout(ctx, { body, bodyClass: 'page-404', indexable: false });
}
