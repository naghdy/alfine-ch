/**
 * Document shell: <head> metadata, security policy, header and footer.
 */
import { esc, header, footer } from './partials.mjs';

/**
 * Content-Security-Policy, delivered as a <meta> tag because GitHub Pages
 * cannot send custom response headers. No inline scripts or styles are used,
 * so nothing needs 'unsafe-inline'. The form origin is the only third party,
 * and only for submitting the contact form.
 * (frame-ancestors, report-uri and sandbox are ignored in <meta> policies.)
 */
export function csp(site, form) {
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    "manifest-src 'self'",
    `connect-src ${site.formOrigin}`,
    // mailto: is allowed only while the form service is not yet configured.
    `form-action ${site.formOrigin}${form.configured ? '' : ' mailto:'}`,
    "base-uri 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function alternates(ctx) {
  const { site, languages, page } = ctx;
  const links = languages.map(
    (l) => `<link rel="alternate" hreflang="${l.lang}" href="${site.origin}${l.paths[page]}">`,
  );
  const fallback = languages.find((l) => l.lang === 'en');
  links.push(`<link rel="alternate" hreflang="x-default" href="${site.origin}${fallback.paths[page]}">`);
  return links.join('\n    ');
}

function organisationJsonLd(ctx) {
  const { site, t } = ctx;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.origin}/#organization`,
    name: site.name,
    url: `${site.origin}${t.paths.home}`,
    email: site.email,
    description: t.orgDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.locality,
      addressCountry: site.countryCode,
    },
  };
  // JSON-LD is a data block, not executable script, so the CSP does not apply.
  // "<" is escaped so the content can never close the element early.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function layout(ctx, { body, bodyClass = '', indexable = true }) {
  const { t, site, page, assets, languages } = ctx;
  const meta = t.meta[page];
  const url = `${site.origin}${t.paths[page] ?? ''}`;
  const other = languages.filter((l) => l.lang !== t.lang);
  const ogImage = `${site.origin}/assets/images/og-image.png`;
  const seo = indexable
    ? `<link rel="canonical" href="${url}">
    ${alternates(ctx)}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(site.name)}">
    <meta property="og:title" content="${esc(meta.title)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:locale" content="${t.locale}">
    ${other.map((l) => `<meta property="og:locale:alternate" content="${l.locale}">`).join('\n    ')}
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(t.meta.home.ogImageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(meta.title)}">
    <meta name="twitter:description" content="${esc(meta.description)}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${esc(t.meta.home.ogImageAlt)}">`
    : '<meta name="robots" content="noindex">';

  return `<!doctype html>
<html lang="${t.lang}" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="${csp(site, ctx.form)}">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}">
    ${seo}
    <meta name="theme-color" content="${site.themeColor}">
    <meta name="color-scheme" content="light">
    <link rel="preload" href="/assets/fonts/fraunces-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${assets.css}">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/assets/icons/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    ${page === 'home' ? organisationJsonLd(ctx) : ''}
    <script src="${assets.js}" defer></script>
  </head>
  <body class="${bodyClass}">
    <div class="backdrop" aria-hidden="true"></div>
    ${header(ctx)}
    <main id="main" tabindex="-1">
${body}
    </main>
    ${footer(ctx)}
    <p class="hud" aria-hidden="true" data-hud><span class="hud__label">${esc(t.ui.hudLabel)}</span> <span data-hud-dir>206° SSW</span> <span class="hud__sep"></span> <span data-hud-time>05:18</span></p>
  </body>
</html>
`;
}
