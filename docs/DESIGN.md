# Design decisions and assumptions

## Design

- **Mood:** quiet, editorial, alpine. Generous whitespace, few elements per section, one accent used sparingly. Nothing moves unless the visitor scrolls, apart from a very slow drift of the haze bands in the hero.
- **Palette** (CSS variables in `src/styles/tokens.css`): deep alpine navy `#0f1e2e` for dark sections, warm stone `#f6f3ee` and `#ede8e0` for light sections, mist blue-greys for secondary text and lines, and muted brass (`#c9ad7f` on dark, `#765b2f` for text on light) as the only accent. Every text/background pair meets WCAG AA; Lighthouse accessibility scores 100.
- **Typography:** Fraunces (variable, optical sizing) for headings at a light weight, Inter for body text. Both are self-hosted WOFF2 files, Latin subset only (about 115 KB together, preloaded). Metric-adjusted local fallbacks avoid layout shift while the fonts load.
- **Wordmark:** "Alfine" set in Fraunces and converted to outlines, so it renders identically everywhere without the font. It is paired with a small line mark: a ridge of two peaks over a lake horizon, in brass.
- **Hero:** an inline SVG of layered ridgelines (generated with midpoint displacement for a natural silhouette) with atmospheric perspective: farther ridges are lighter and hazier. A faint horizon line and shimmer lines suggest Lake Zug, with dark shoreline hills in the foreground and a low warm glow near the horizon. A gentle parallax moves each layer at a different rate on scroll. Parallax, drift and scroll reveals are all disabled for `prefers-reduced-motion`.
- **Motif reuse:** three ridgeline dividers separate the alternating light and dark sections, a faint ridge silhouette sits behind the footer, the peak mark appears in the header, footer, favicon and app icons, and the Open Graph image uses the same ridges.
- **Rhythm:** hero (dark) > About (light) > What we do (warm light) > Principles (dark) > Trust (light) > Location (dark) > Contact (light) > Footer (dark).
- **Location panel:** a stylised, abstract map of Lake Zug with contour lines and a brass marker for Zug, drawn in SVG (one version per language for the lake label). No third-party map is embedded.
- **Icons on the focus cards:** a roofline on a ridge for property, and growth rings for investments, chosen as an image of patience rather than a chart.

## Technical

- **Plain HTML, CSS and vanilla JS** with a ~150-line Node build script and no dependencies. This keeps the build fast, the output fully static and the supply chain empty. Copy lives in one content file per language; templates are small JavaScript functions.
- **Bilingual structure:** English at `/`, German at `/de/`, legal pages at `/impressum/`, `/privacy/`, `/de/impressum/`, `/de/datenschutz/`. Every page has `hreflang` alternates (en, de, x-default to English), its own canonical URL, translated title, description and Open Graph tags. The switcher links to the equivalent page; there is no automatic redirect by browser language.
- **No layout shift:** the map image has fixed dimensions and an aspect-ratio box, reveal animations use only opacity and transform and only apply to content below the fold, and fonts have metric-matched fallbacks. Lighthouse reports CLS 0.
- **Lazy loading:** the only image below the fold (the map) is lazy-loaded. Everything else is inline SVG or CSS.
- **Security:** strict meta CSP with no `'unsafe-inline'`; the parallax sets a CSS custom property through the CSSOM, which the CSP allows. Referrer policy `strict-origin-when-cross-origin` (needed for Formspree's domain restriction).
- **Contact form:** works without JavaScript (posts to Formspree directly) and with it (inline validation, AJAX submit, success and error states, focus management, `aria-invalid` and linked error messages). The honeypot uses Formspree's `_gotcha` field. An empty subject is filled with "New enquiry via alfine.ch" / "Neue Anfrage über alfine.ch", and a hidden `language` field tells you which page it came from.
- **Email address:** written as HTML entities in a normal `mailto:` link. It reads and works normally for people and screen readers, without JavaScript, while defeating naive harvesters.
- **404:** one bilingual page, since GitHub Pages serves a single `404.html`.

## Assumptions

- The company is organised under Swiss law with its seat in Zug and is entered in the Zug commercial register, as the Impressum says. Adjust if not.
- No personal names appear anywhere, including the Impressum. Swiss law requires the provider's identity and address; naming authorised signatories is common but optional, so it is left out. Add it to the content files if you want it.
- The legal texts are a careful starting point, not legal advice. They name GitHub (hosting) and Formspree (form) as processors, both in the USA, and leave the email provider as a placeholder.
- The JSON-LD Organization includes name, URL, email, locality (Zug) and country (CH) as requested, plus a one-line translated description so the German page carries German structured data. Remove `description` in `src/templates/layout.mjs` if you want the strict minimum.
- "Our approach" in the hero links to the "Who we are" section.
- The About section has three short pillars (Family-owned, Independent, Rooted in Zug) to give the section structure without inventing facts or figures.
- The principles are the six suggested in the brief, each in one line.
- The mailbox recommendation is Namecheap Private Email for simplicity; Infomaniak is named as the Swiss-hosted alternative.
- GitHub Actions uses the action versions from GitHub's current official Pages example (`checkout@v6`, `upload-pages-artifact@v4`, `deploy-pages@v4`). Newer major versions exist and can be adopted later.
- The build uses the Node.js preinstalled on GitHub's Ubuntu runners (Node 20 or later), so no setup step is needed.
