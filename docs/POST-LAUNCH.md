# Post-launch checklist

Run through this once DNS, HTTPS and the mailbox are set up.

## HTTPS and domain

- [ ] `https://alfine.ch` loads with a valid certificate (padlock, no warnings).
- [ ] `http://alfine.ch` redirects to `https://alfine.ch` (Enforce HTTPS is on).
- [ ] `https://www.alfine.ch` redirects to `https://alfine.ch`.
- [ ] `curl -sI https://alfine.ch/` returns `200`; note which security headers GitHub sends.
- [ ] A missing page (e.g. `https://alfine.ch/test-404`) shows the bilingual 404 page.

## Contact form

- [ ] English form (`/#contact`): send a test message; the success message appears and the email arrives at info@alfine.ch.
- [ ] German form (`/de/#contact`): same test; the email shows `language: de`.
- [ ] Submit with empty fields: errors appear next to the fields in the page language.
- [ ] Formspree dashboard: the submissions are listed, **Restrict to Domain** is set to `alfine.ch`, and test messages did not land in spam.

## Email deliverability

- [ ] Send from info@alfine.ch to a Gmail address; **Show original** reports SPF, DKIM and DMARC as PASS.
- [ ] Reply from Gmail to info@alfine.ch arrives.
- [ ] Optional: mail-tester.com score of 9/10 or better.
- [ ] After 2 to 4 weeks of clean DMARC reports, tighten DMARC from `p=none` to `p=quarantine`.

## Languages and SEO

- [ ] EN | DE switcher in the header and footer goes to the equivalent page on every page (home, Impressum, Privacy/Datenschutz).
- [ ] View source on `/` and `/de/`: `lang` attribute, canonical URL and the three `hreflang` links (en, de, x-default) are correct.
- [ ] Share `https://alfine.ch` in a messaging app or a social preview tool: title, description and the ridgeline image appear.
- [ ] Google Search Console: add the domain property `alfine.ch` (DNS TXT verification at Namecheap) and submit `https://alfine.ch/sitemap.xml`.
- [ ] Optional: Bing Webmaster Tools, same sitemap.

## Final checks

- [ ] `npm run build` lists no remaining placeholders.
- [ ] Lighthouse (Chrome DevTools) on `https://alfine.ch` and `/de/`: 95+ in all four categories on mobile.
- [ ] Domain auto-renew on; DNSSEC on.
