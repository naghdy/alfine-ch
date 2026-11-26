/**
 * English copy for alfine.ch.
 *
 * Edit text here without touching markup. A few conventions:
 *  - Plain text only. HTML is escaped when the page is built.
 *  - {email} is replaced with the (lightly obfuscated) email link.
 *  - Text in [SQUARE BRACKETS] is a placeholder that must be filled in before
 *    launch. The build lists every placeholder it finds.
 *  - Keep the keys identical in de.mjs.
 */
export default {
  lang: 'en',
  locale: 'en_CH',
  langName: 'English',
  langShort: 'EN',

  // The page for this language. Everything else is a section on it.
  paths: {
    home: '/',
  },

  ui: {
    skipLink: 'Skip to main content',
    homeLabel: 'Alfine, home',
    mainNavLabel: 'Main',
    footerNavLabel: 'Footer',
    legalNavLabel: 'Legal',
    languageLabel: 'Language',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    contactButton: 'Contact',
    backToHome: 'Back to the homepage',
    descriptor: 'A private, family-owned holding company in Zug, Switzerland.',
    rights: 'All rights reserved.',
    backToTop: 'Back to top',
    legalOpen: 'Read',
    // Shown beside the scene: the compass bearing of the view and its hour.
    hudLabel: 'Looking',
  },

  nav: [
    { id: 'about', label: 'About' },
    { id: 'what-we-do', label: 'What we do' },
    { id: 'principles', label: 'Principles' },
    { id: 'trust', label: 'Trust' },
    { id: 'location', label: 'Location' },
  ],

  meta: {
    home: {
      title: 'Alfine · Private holding company in Zug, Switzerland',
      description:
        'Alfine is a private, family-owned holding company in Zug, Switzerland, focused on property development and long-term investments.',
      ogImageAlt: 'The Alfine wordmark above layered mountain ridgelines.',
    },
    notFound: {
      title: 'Page not found · Alfine',
      description: 'The page you were looking for could not be found.',
    },
  },

  // Used in the JSON-LD Organization description.
  orgDescription:
    'A private, family-owned holding company in Zug, Switzerland, focused on property development and long-term investments.',

  hero: {
    eyebrow: 'Zug, Switzerland',
    heading: 'Building and holding value, patiently.',
    lead:
      'Alfine is a private, family-owned holding company in Zug. We develop property and make long-term investments, guided by a horizon measured in decades rather than quarters.',
    primaryCta: 'Get in touch',
    secondaryCta: 'Our approach',
  },

  about: {
    eyebrow: 'Who we are',
    heading: 'A private company with a long view',
    paragraphs: [
      'Alfine is a family-owned holding company based in Zug. We invest our own capital, which allows us to act with patience and to judge every decision on its long-term merit.',
      'We are independent. We answer to no outside shareholders and follow no fixed timetable, so we can take the time to understand an opportunity properly and stay with it for as long as it makes sense.',
      'We prefer to work quietly. Our relationships are built on trust and continuity, and we value them as highly as any asset.',
    ],
    pillars: [
      { title: 'Family-owned', text: 'Private capital, held for the long term.' },
      { title: 'Independent', text: 'Free to decide on our own timetable.' },
      { title: 'Rooted in Zug', text: 'A Swiss home and a steady outlook.' },
    ],
  },

  work: {
    eyebrow: 'What we do',
    heading: 'Two areas of focus',
    intro:
      'Our activity rests on two complementary pillars. We approach both with the same care and the same long horizon.',
    cards: [
      {
        title: 'Property Development',
        text:
          'We acquire, develop and renew property with an emphasis on quality, thoughtful design and lasting value. Each project is considered on its own terms, from first assessment through to completion, and carried out with trusted partners.',
      },
      {
        title: 'Investments',
        text:
          'We make long-term private investments across a diversified range of assets. Our approach is disciplined and patient: we favour quality, resilience and sound fundamentals over short-term movements, and we protect capital first.',
      },
    ],
    note: 'We do not publish details of our holdings. If you would like to discuss an opportunity, please get in touch.',
    noteCta: 'Contact us',
  },

  principles: {
    eyebrow: 'Our principles',
    heading: 'What guides us',
    intro: 'A few simple convictions shape how we work.',
    mapCaption: 'The Zugerberg above Zug. Contour lines every 40 metres.',
    items: [
      { title: 'Long-term thinking', text: 'We measure success in decades and decide accordingly.' },
      { title: 'Discretion', text: 'We keep our affairs, and those of our partners, private.' },
      { title: 'Integrity and transparency', text: 'We say what we mean and keep our word.' },
      { title: 'Prudent risk', text: 'We protect capital first and avoid what we do not understand.' },
      { title: 'Local roots, global outlook', text: 'We are anchored in Zug and open to the world.' },
      { title: 'Partnership', text: 'We build lasting relationships on fairness and mutual respect.' },
    ],
  },

  trust: {
    eyebrow: 'Trust and security',
    heading: 'How we operate',
    intro:
      'Trust is earned over time. We aim to earn it through the way we conduct our business, every day.',
    items: [
      {
        title: 'Confidentiality',
        text: 'Information shared with us is handled with care and used only for the purpose for which it was provided.',
      },
      {
        title: 'Careful governance',
        text: 'Important decisions are taken deliberately and with appropriate checks, never in haste.',
      },
      {
        title: 'Swiss legal framework',
        text: 'As a Swiss company based in Zug, we operate under Swiss law and its long tradition of legal certainty.',
      },
      {
        title: 'Data protection',
        text: 'We collect as little personal data as possible. This website uses no cookies, no analytics and no third-party trackers.',
      },
    ],
  },

  location: {
    eyebrow: 'Location',
    heading: 'Rooted in Zug',
    paragraphs: [
      'Zug lies between lake and mountains at the heart of Switzerland. It combines a stable, well-run environment with a long tradition of private enterprise and international openness.',
      'It is a natural home for a company that values continuity, prudence and a clear view of the horizon.',
    ],
    facts: [
      { label: 'Canton', value: 'Zug' },
      { label: 'Country', value: 'Switzerland' },
    ],
    // Names written onto the landscape as you scroll through this section.
    labelsIntro: 'In the view south across the lake:',
    labels: {
      zugerberg: 'Zugerberg',
      rigi: 'Rigi',
      alps: 'Eiger, Mönch, Jungfrau',
      pilatus: 'Pilatus',
      lake: 'Lake Zug',
    },
  },

  contact: {
    eyebrow: 'Contact',
    heading: 'Get in touch',
    intro:
      'We welcome thoughtful enquiries. If you would like to discuss an opportunity or learn more about us, please write to us. We reply personally and treat every message in confidence.',
    emailLabel: 'Email',
    locationLabel: 'Location',
    locationValue: 'Zug, Switzerland',
    postalLabel: 'Postal address',
    postalLines: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Switzerland'],
    form: {
      heading: 'Send us a message',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      optional: 'optional',
      message: 'Message',
      honeypot: 'Leave this field empty',
      submit: 'Send message',
      sending: 'Sending…',
      emailSubject: 'New enquiry via alfine.ch',
      privacyNote: 'We use the details you provide only to respond to your enquiry. See our',
      privacyLinkText: 'privacy policy',
      errors: {
        name: 'Please enter your name.',
        email: 'Please enter a valid email address.',
        message: 'Please enter a message.',
        summary: 'Please check the highlighted fields.',
      },
      successTitle: 'Thank you.',
      successText: 'Your message has been sent. We will reply as soon as we can.',
      errorText: 'Sorry, your message could not be sent. Please try again, or email us directly at',
    },
  },

  notFound: {
    heading: 'Page not found',
    text: 'The page you were looking for does not exist or has moved.',
  },

  legal: {
    impressum: {
      heading: 'Impressum',
      subheading: 'Legal notice',
      sections: [
        {
          heading: 'Company',
          address: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Switzerland'],
        },
        { heading: 'Contact', body: ['Email: {email}'] },
        {
          heading: 'Commercial register',
          body: [
            'Entered in the commercial register of the Canton of Zug.',
            'Company identification number (UID): [UID NUMBER]',
            'VAT number: [VAT NUMBER, OR DELETE THIS LINE IF NOT REGISTERED]',
          ],
        },
        {
          heading: 'Disclaimer',
          body: [
            'The content of this website is provided for general information only. It does not constitute an offer, a solicitation or advice of any kind, and in particular it is not an offer to buy or sell any financial instrument or property.',
            'We take care to keep this information accurate and up to date, but we give no warranty as to its accuracy, completeness or timeliness. To the extent permitted by law, we accept no liability for any loss arising from access to or use of this website.',
          ],
        },
        {
          heading: 'Copyright',
          body: [
            'All content on this website, including text, design and graphics, belongs to [LEGAL ENTITY NAME] unless stated otherwise. Any reproduction requires our prior written consent.',
            'The typefaces Fraunces and Inter are used under the SIL Open Font License.',
            'The landscape is drawn from open elevation data: Terrain Tiles by Mapzen, distributed through the AWS Open Data programme. EU-DEM layers produced using Copernicus data and information funded by the European Union.',
          ],
        },
      ],
    },
    privacy: {
      heading: 'Privacy policy',
      subheading: 'Last updated: November 2026',
      sections: [
        {
          heading: 'Overview',
          body: [
            'This privacy policy explains how [LEGAL ENTITY NAME] ("Alfine", "we") processes personal data in connection with this website. We process as little personal data as possible and do so in accordance with the Swiss Federal Act on Data Protection (FADP) and, where it applies, the EU General Data Protection Regulation (GDPR).',
          ],
        },
        {
          heading: 'Controller',
          address: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Switzerland'],
          body: ['For any questions about data protection, please contact us at {email}.'],
        },
        {
          heading: 'Visiting this website',
          body: [
            'This website is hosted on GitHub Pages, a service of GitHub, Inc., USA. When you visit it, GitHub processes the technical data needed to deliver the site and keep it secure, such as your IP address, the date and time of access, the page requested and your browser type. We do not receive these logs and do not use them to identify visitors.',
          ],
        },
        {
          heading: 'No cookies and no tracking',
          body: [
            'This website does not use cookies, analytics, advertising technologies, social media plug-ins or any other tracking tools. Fonts and all other resources are served from our own domain, so loading a page does not pass your data to third parties such as font or content delivery providers.',
          ],
        },
        {
          heading: 'Contact form and email',
          body: [
            'If you contact us through the form or by email, we process the details you provide, such as your name, email address and message, solely to handle your enquiry.',
            'Messages sent through the form are transmitted by Formspree, a service of Formspree, Inc., USA, which forwards them to us by email and processes the data on our behalf. Our email is hosted by [EMAIL PROVIDER NAME, COUNTRY].',
            'Please do not include sensitive personal information in your message.',
          ],
        },
        {
          heading: 'Disclosure abroad',
          body: [
            'Some of the service providers named above are based in the United States. Where personal data is transferred to a country without an adequate level of data protection, we rely on appropriate safeguards, such as the provider’s certification under the Swiss-U.S. Data Privacy Framework where available, or standard contractual clauses recognised by the Federal Data Protection and Information Commissioner (FDPIC).',
          ],
        },
        {
          heading: 'Retention',
          body: [
            'We keep enquiries only for as long as necessary to deal with them and to meet any legal retention obligations. After that, they are deleted.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'Subject to applicable law, you have the right to request access to your personal data, to have it corrected or deleted, to object to its processing and to receive it in a commonly used electronic format. To exercise these rights, please contact us at {email}.',
            'You may also lodge a complaint with the Federal Data Protection and Information Commissioner (FDPIC) in Switzerland or, where the GDPR applies, with a data protection authority in the European Union.',
          ],
        },
        {
          heading: 'Security',
          body: [
            'We take appropriate technical and organisational measures to protect personal data. This website is served only over an encrypted connection (HTTPS).',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: ['We may update this policy from time to time. The version published on this website applies.'],
        },
      ],
    },
  },
};
