/**
 * Site-wide settings shared by both languages.
 * Language-specific copy lives in en.mjs and de.mjs.
 */
export default {
  name: 'Alfine',
  domain: 'alfine.ch',
  origin: 'https://alfine.ch',
  email: 'info@alfine.ch',
  locality: 'Zug',
  countryCode: 'CH',
  copyrightYear: 2026,

  // Brand colours used outside CSS (browser UI, web manifest).
  themeColor: '#0f1e2e',
  backgroundColor: '#f6f3ee',

  // Contact form endpoint. The form ID is not a secret, but it is kept out of
  // the repository and injected at build time from the FORMSPREE_FORM_ID
  // environment variable (a GitHub Actions repository variable in CI).
  formEndpointBase: 'https://formspree.io/f/',
  formOrigin: 'https://formspree.io',
};
