# alfine.ch

Marketing website for Alfine, a private, family-owned holding company in Zug, Switzerland.

A fully static, bilingual (English and German) single page with no runtime dependencies, no cookies, no analytics and no third-party scripts. It is built by a small Node script and published to GitHub Pages by GitHub Actions.

- English: `/`  German: `/de/`
- Everything is on that one page. The Impressum and Privacy policy sit at the foot as expandable sections, reachable directly at `/#impressum` and `/#privacy` (`/de/#impressum`, `/de/#privacy`).

Behind the page, a canvas draws the real view south from Zug's lakefront: the Zugerberg, the Rigi, the Bernese Alps and Pilatus across the lake. As you scroll, the day passes from dawn to night, the sun sets beside Pilatus, a steamer crosses the lake and the water mirrors it all. See [docs/DESIGN.md](docs/DESIGN.md).

## Run it locally

Requires Node.js 20 or later. Nothing to install.

```sh
npm start            # build into _site/ and serve at http://localhost:8080
```

Or step by step:

```sh
npm run build        # writes the site to _site/
npm run serve        # serves _site/ (port 8080, or: node tools/serve.mjs 3000)
npm run check        # checks internal links and #anchors in _site/
npm run validate     # optional: HTML validation (downloads html-validate via npx)
```

To test the contact form locally, copy `.env.example` to `.env` and set `FORMSPREE_FORM_ID`.

## Editing text

All copy lives in one file per language. Edit text there without touching markup:

| File | Contents |
|---|---|
| `src/content/en.mjs` | English copy, page title, meta description, legal texts |
| `src/content/de.mjs` | German copy (Swiss conventions: "ss", formal "Sie") |
| `src/content/site.mjs` | Shared settings: domain, email, colours, form endpoint |

Text in `[SQUARE BRACKETS]` is a placeholder. Every build lists the placeholders that remain.

## Project structure

```
src/
  content/      copy (en.mjs, de.mjs) and shared settings (site.mjs)
  templates/    page markup as small JavaScript template functions
  styles/       CSS: tokens (design variables), base, layout, components, sections
  scripts/      browser JS: the scene (scene.js), header and menu, reveals,
                contour drawing and legal sections (details.js), contact form
  data/         skyline.json: the view south, generated from terrain data
  svg/          wordmark, mark, contour map (generated)
  assets/       self-hosted fonts (OFL), icons, images (copied as-is)
  static/       files for the site root: CNAME, .nojekyll, favicon.ico
tools/
  build.mjs           static build (Node built-ins only)
  serve.mjs           local preview server
  check-links.mjs     internal link checker
  render-images.mjs   regenerates PNG icons and the OG image (needs puppeteer)
  terrain/            Python scripts that build the skyline and contours
                      from open elevation data (see tools/terrain/README.md)
docs/
  DEPLOYMENT.md       GitHub Pages, Namecheap DNS and email setup
  POST-LAUNCH.md      checks to run after go-live
  DESIGN.md           design decisions and assumptions
```

## How deployment works

`.github/workflows/deploy.yml` runs on every push to `main`: it builds the site, checks links and publishes `_site/` to GitHub Pages. Pull requests are built and checked but not deployed. The one-time setup (Pages source, custom domain, HTTPS, DNS and email) is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contact form (Formspree)

GitHub Pages has no server, so the form posts to [Formspree](https://formspree.io), which forwards each message by email. The form validates in the browser, has a honeypot field (`_gotcha`) and shows clear success and error states. The email address is shown on the page as a normal `mailto:` link (lightly obfuscated with HTML entities), so visitors can always write directly.

Setup:

1. Create a Formspree account and a new form. Set its notification email to `info@alfine.ch` (Formspree asks you to confirm that address).
2. Copy the form ID: the last part of the endpoint `https://formspree.io/f/<FORM_ID>`.
3. In the GitHub repository go to **Settings > Secrets and variables > Actions > Variables** and add a repository variable named `FORMSPREE_FORM_ID` with that ID. The ID is not a secret (it is visible in the page source), but keeping it out of the code means it can be changed without a commit.
4. In Formspree, open the form's project settings and turn on **Restrict to Domain** with `alfine.ch`. This relies on the browser's Referer header; the site's `strict-origin-when-cross-origin` referrer policy supports it.
5. Re-run the workflow (Actions > Build and deploy > Run workflow) or push to `main`.

Until the variable is set, the build warns and the form shows its error state with the email address instead of posting.

The Content-Security-Policy already allows the form endpoint. If you ever switch provider, update `formEndpointBase` and `formOrigin` in `src/content/site.mjs`; the policy's `connect-src` and `form-action` follow `formOrigin` automatically. For Formspree they are:

```
connect-src https://formspree.io
form-action https://formspree.io
```

Formspree's free plan has a monthly submission limit; check the current plans before launch.

## Security and privacy

- **No cookies, analytics, trackers, embeds or third-party requests.** Fonts (Marcellus and Jost, SIL Open Font License) are self-hosted. No cookie banner is needed.
- **Content-Security-Policy** is set with a `<meta http-equiv>` tag on every page, because GitHub Pages cannot send custom response headers. There are no inline scripts or styles, so the policy needs no `'unsafe-inline'`:
  `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; manifest-src 'self'; connect-src https://formspree.io; form-action https://formspree.io; base-uri 'none'; upgrade-insecure-requests`
  (JSON-LD is a non-executable data block and is not affected by `script-src`.)
- **Referrer policy** is set with `<meta name="referrer" content="strict-origin-when-cross-origin">`.
- **Headers that cannot be set on GitHub Pages:** `Strict-Transport-Security`, `X-Frame-Options` / CSP `frame-ancestors` (ignored in meta tags), `X-Content-Type-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and CSP reporting (`report-to`). GitHub controls the response headers; check what it sends with `curl -sI https://alfine.ch/`. If these headers become a requirement, put a CDN such as Cloudflare in front of Pages and set them there.
- There is deliberately no `_headers` file (GitHub Pages ignores it).
- No secrets are stored in the repository. `.env` is git-ignored; `.env.example` holds placeholders only.

## Fill in before launch

- [ ] Legal entity name: replace `[LEGAL ENTITY NAME]` (both languages, Impressum, Privacy and the contact postal address)
- [ ] Street address and postcode: `[STREET ADDRESS]`, `[POSTCODE]`
- [ ] UID number: `[UID NUMBER]` (format CHE-xxx.xxx.xxx)
- [ ] VAT number, or delete that line if not VAT-registered: `[VAT NUMBER, OR DELETE THIS LINE IF NOT REGISTERED]`
- [ ] Email provider for the privacy policy: `[EMAIL PROVIDER NAME, COUNTRY]`
- [ ] Review the English Impressum and Privacy policy (`src/content/en.mjs`, `legal`)
- [ ] Review the German Impressum and Datenschutzerklärung (`src/content/de.mjs`, `legal`)
- [ ] Confirm the transfer safeguards named in "Disclosure abroad" match your providers (GitHub, Formspree, email host); have the legal pages reviewed by a Swiss lawyer if in doubt
- [ ] Update "Last updated: November 2026" / "Stand: November 2026" if you change the privacy policy
- [ ] Formspree form ID: repository variable `FORMSPREE_FORM_ID` (see above)
- [ ] Mailbox `info@alfine.ch` working (see docs/DEPLOYMENT.md)

Run `npm run build`: when it no longer lists placeholders, the content is complete.

## Changing the artwork

The skyline (`src/data/skyline.json`) and the contour map (`src/svg/contours.svg`) are generated from elevation data by the scripts in `tools/terrain/`; both outputs are committed, so the build never needs Python or the network. The mark is an SVG file in `src/svg/`. The wordmark (`src/svg/wordmark.svg`) is "Alfine" set in the self-hosted Marcellus font and converted to outlines by `python3 tools/wordmark.py` (needs `pip install fonttools brotli`). The PNG icons, `favicon.ico` and the Open Graph image (drawn from the same skyline) are generated and committed. After changing `src/assets/icons/icon.svg`, the wordmark or the skyline, regenerate them:

```sh
npm install --no-save puppeteer
npm run images
```
