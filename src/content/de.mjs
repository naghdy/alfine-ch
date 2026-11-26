/**
 * Deutsche Texte für alfine.ch (Schweizer Schreibweise: «ss» statt «ß»,
 * Anrede mit «Sie»).
 *
 * Texte hier bearbeiten, ohne das Markup anzufassen:
 *  - Nur reiner Text. HTML wird beim Erstellen der Seiten maskiert.
 *  - {email} wird durch den (leicht verschleierten) E-Mail-Link ersetzt.
 *  - Text in [ECKIGEN KLAMMERN] ist ein Platzhalter, der vor dem Launch
 *    ersetzt werden muss. Der Build listet alle gefundenen Platzhalter auf.
 *  - Die Schlüssel müssen mit en.mjs übereinstimmen.
 */
export default {
  lang: 'de',
  locale: 'de_CH',
  langName: 'Deutsch',
  langShort: 'DE',

  // Die Seite in dieser Sprache. Alles andere sind Abschnitte darauf.
  paths: {
    home: '/de/',
  },

  ui: {
    skipLink: 'Zum Inhalt springen',
    homeLabel: 'Alfine, Startseite',
    mainNavLabel: 'Hauptnavigation',
    footerNavLabel: 'Fussnavigation',
    legalNavLabel: 'Rechtliches',
    languageLabel: 'Sprache',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schliessen',
    contactButton: 'Kontakt',
    backToHome: 'Zurück zur Startseite',
    descriptor: 'Eine private Holdinggesellschaft in Familienbesitz in Zug, Schweiz.',
    rights: 'Alle Rechte vorbehalten.',
    backToTop: 'Nach oben',
    legalOpen: 'Lesen',
    // Neben der Szene: Höhe der Standseilbahn und Tageszeit der Szene.
    hudLabel: 'Zugerbergbahn',
  },

  nav: [
    { id: 'about', label: 'Über uns' },
    { id: 'what-we-do', label: 'Tätigkeit' },
    { id: 'principles', label: 'Grundsätze' },
    { id: 'trust', label: 'Vertrauen' },
    { id: 'location', label: 'Standort' },
  ],

  meta: {
    home: {
      title: 'Alfine · Private Holdinggesellschaft in Zug, Schweiz',
      description:
        'Alfine ist eine private Holdinggesellschaft in Familienbesitz mit Sitz in Zug, Schweiz. Schwerpunkte sind Immobilienentwicklung und langfristige Investitionen.',
      ogImageAlt: 'Die Wortmarke Alfine über geschichteten Bergkämmen.',
    },
    notFound: {
      title: 'Seite nicht gefunden · Alfine',
      description: 'Die gesuchte Seite wurde nicht gefunden.',
    },
  },

  orgDescription:
    'Eine private Holdinggesellschaft in Familienbesitz mit Sitz in Zug, Schweiz, mit den Schwerpunkten Immobilienentwicklung und langfristige Investitionen.',

  hero: {
    eyebrow: 'Zug, Schweiz',
    heading: 'Werte schaffen und mit Geduld bewahren.',
    lead:
      'Alfine ist eine private Holdinggesellschaft in Familienbesitz mit Sitz in Zug. Wir entwickeln Immobilien und tätigen langfristige Investitionen, mit einem Horizont, der in Jahrzehnten statt in Quartalen bemessen wird.',
    primaryCta: 'Kontakt aufnehmen',
    secondaryCta: 'Unser Ansatz',
  },

  about: {
    eyebrow: 'Über uns',
    heading: 'Ein privates Unternehmen mit langem Atem',
    paragraphs: [
      'Alfine ist eine Holdinggesellschaft in Familienbesitz mit Sitz in Zug. Wir investieren eigenes Kapital. Das erlaubt uns, mit Geduld zu handeln und jede Entscheidung nach ihrem langfristigen Wert zu beurteilen.',
      'Wir sind unabhängig. Wir sind keinen externen Aktionären verpflichtet und folgen keinem starren Zeitplan. So können wir uns die Zeit nehmen, eine Gelegenheit gründlich zu verstehen, und ihr so lange treu bleiben, wie es sinnvoll ist.',
      'Wir arbeiten mit Zurückhaltung. Unsere Beziehungen beruhen auf Vertrauen und Beständigkeit, und wir schätzen sie ebenso hoch wie jeden Vermögenswert.',
    ],
    pillars: [
      { title: 'In Familienbesitz', text: 'Privates Kapital, langfristig gehalten.' },
      { title: 'Unabhängig', text: 'Frei, im eigenen Takt zu entscheiden.' },
      { title: 'In Zug verwurzelt', text: 'Ein Schweizer Zuhause und ein ruhiger Blick nach vorn.' },
    ],
  },

  work: {
    eyebrow: 'Tätigkeit',
    heading: 'Zwei Schwerpunkte',
    intro:
      'Unsere Tätigkeit ruht auf zwei sich ergänzenden Pfeilern. Beide verfolgen wir mit derselben Sorgfalt und demselben langen Horizont.',
    cards: [
      {
        title: 'Immobilienentwicklung',
        text:
          'Wir erwerben, entwickeln und erneuern Immobilien mit Blick auf Qualität, durchdachte Gestaltung und bleibenden Wert. Jedes Projekt betrachten wir für sich, von der ersten Beurteilung bis zur Fertigstellung, und setzen es mit verlässlichen Partnern um.',
      },
      {
        title: 'Investitionen',
        text:
          'Wir tätigen langfristige private Investitionen in einem breit diversifizierten Spektrum von Anlagen. Wir gehen diszipliniert und geduldig vor: Qualität, Widerstandsfähigkeit und solide Grundlagen sind uns wichtiger als kurzfristige Schwankungen, und der Schutz des Kapitals hat Vorrang.',
      },
    ],
    note: 'Einzelheiten zu unseren Beteiligungen veröffentlichen wir nicht. Wenn Sie eine Gelegenheit besprechen möchten, nehmen Sie gerne Kontakt mit uns auf.',
    noteCta: 'Kontakt',
  },

  principles: {
    eyebrow: 'Unsere Grundsätze',
    heading: 'Was uns leitet',
    intro: 'Einige einfache Überzeugungen prägen unsere Arbeit.',
    mapCaption: 'Der Zugerberg über Zug. Höhenlinien alle 40 Meter.',
    items: [
      { title: 'Langfristiges Denken', text: 'Wir messen Erfolg in Jahrzehnten und entscheiden entsprechend.' },
      { title: 'Diskretion', text: 'Unsere Angelegenheiten und jene unserer Partner behandeln wir vertraulich.' },
      { title: 'Integrität und Transparenz', text: 'Wir sagen, was wir meinen, und halten Wort.' },
      { title: 'Umsicht im Umgang mit Risiken', text: 'Der Erhalt des Kapitals hat Vorrang. Was wir nicht verstehen, meiden wir.' },
      { title: 'Lokal verwurzelt, global ausgerichtet', text: 'Wir sind in Zug verankert und offen für die Welt.' },
      { title: 'Partnerschaft', text: 'Wir pflegen dauerhafte Beziehungen, getragen von Fairness und gegenseitigem Respekt.' },
    ],
  },

  trust: {
    eyebrow: 'Vertrauen und Sicherheit',
    heading: 'Wie wir arbeiten',
    intro:
      'Vertrauen entsteht über die Zeit. Wir möchten es durch die Art verdienen, wie wir unsere Geschäfte führen, jeden Tag.',
    items: [
      {
        title: 'Vertraulichkeit',
        text: 'Informationen, die Sie uns anvertrauen, behandeln wir mit Sorgfalt und verwenden sie nur für den Zweck, für den sie uns übermittelt wurden.',
      },
      {
        title: 'Sorgfältige Führung',
        text: 'Wichtige Entscheidungen treffen wir überlegt und mit angemessener Prüfung, nie überstürzt.',
      },
      {
        title: 'Schweizer Rechtsrahmen',
        text: 'Als Schweizer Unternehmen mit Sitz in Zug handeln wir im Rahmen des Schweizer Rechts und seiner langen Tradition der Rechtssicherheit.',
      },
      {
        title: 'Datenschutz',
        text: 'Wir erheben so wenige Personendaten wie möglich. Diese Website verwendet keine Cookies, keine Analysewerkzeuge und keine Tracker von Drittanbietern.',
      },
    ],
  },

  location: {
    eyebrow: 'Standort',
    heading: 'Verwurzelt in Zug',
    paragraphs: [
      'Zug liegt zwischen See und Bergen im Herzen der Schweiz. Der Ort verbindet ein stabiles, gut geführtes Umfeld mit einer langen Tradition privaten Unternehmertums und internationaler Offenheit.',
      'Für ein Unternehmen, das Beständigkeit, Umsicht und einen klaren Blick auf den Horizont schätzt, ist Zug ein natürliches Zuhause.',
    ],
    facts: [
      { label: 'Kanton', value: 'Zug' },
      { label: 'Land', value: 'Schweiz' },
    ],
    // Namen, die beim Scrollen durch diesen Abschnitt in die Landschaft geschrieben werden.
    labelsIntro: 'Im Blick vom See:',
    labels: {
      zug: 'Zug',
      zugerberg: 'Zugerberg',
      funicular: 'Zugerbergbahn',
      rigi: 'Rigi',
      pilatus: 'Pilatus',
      lake: 'Zugersee',
    },
  },

  contact: {
    eyebrow: 'Kontakt',
    heading: 'Nehmen Sie Kontakt auf',
    intro:
      'Wir freuen uns über durchdachte Anfragen. Wenn Sie eine Gelegenheit besprechen oder mehr über uns erfahren möchten, schreiben Sie uns. Wir antworten persönlich und behandeln jede Nachricht vertraulich.',
    emailLabel: 'E-Mail',
    locationLabel: 'Standort',
    locationValue: 'Zug, Schweiz',
    postalLabel: 'Postadresse',
    postalLines: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Schweiz'],
    form: {
      heading: 'Schreiben Sie uns',
      name: 'Name',
      email: 'E-Mail',
      subject: 'Betreff',
      optional: 'optional',
      message: 'Nachricht',
      honeypot: 'Dieses Feld bitte leer lassen',
      submit: 'Nachricht senden',
      sending: 'Wird gesendet…',
      emailSubject: 'Neue Anfrage über alfine.ch',
      privacyNote: 'Wir verwenden Ihre Angaben ausschliesslich zur Beantwortung Ihrer Anfrage. Weitere Informationen finden Sie in unserer',
      privacyLinkText: 'Datenschutzerklärung',
      errors: {
        name: 'Bitte geben Sie Ihren Namen ein.',
        email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        message: 'Bitte geben Sie eine Nachricht ein.',
        summary: 'Bitte prüfen Sie die markierten Felder.',
      },
      successTitle: 'Vielen Dank.',
      successText: 'Ihre Nachricht wurde übermittelt. Wir melden uns so bald wie möglich bei Ihnen.',
      errorText: 'Ihre Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an',
    },
  },

  notFound: {
    heading: 'Seite nicht gefunden',
    text: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
  },

  legal: {
    impressum: {
      heading: 'Impressum',
      subheading: 'Angaben zum Unternehmen',
      sections: [
        {
          heading: 'Unternehmen',
          address: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Schweiz'],
        },
        { heading: 'Kontakt', body: ['E-Mail: {email}'] },
        {
          heading: 'Handelsregister',
          body: [
            'Eingetragen im Handelsregister des Kantons Zug.',
            'Unternehmens-Identifikationsnummer (UID): [UID NUMBER]',
            'Mehrwertsteuernummer: [VAT NUMBER, OR DELETE THIS LINE IF NOT REGISTERED]',
          ],
        },
        {
          heading: 'Haftungsausschluss',
          body: [
            'Die Inhalte dieser Website dienen ausschliesslich der allgemeinen Information. Sie stellen weder ein Angebot noch eine Aufforderung oder Beratung irgendwelcher Art dar, insbesondere kein Angebot zum Kauf oder Verkauf von Finanzinstrumenten oder Immobilien.',
            'Wir achten sorgfältig darauf, dass diese Informationen korrekt und aktuell sind, übernehmen jedoch keine Gewähr für deren Richtigkeit, Vollständigkeit oder Aktualität. Soweit gesetzlich zulässig, lehnen wir jede Haftung für Schäden ab, die aus dem Zugriff auf diese Website oder ihrer Nutzung entstehen.',
          ],
        },
        {
          heading: 'Urheberrecht',
          body: [
            'Sämtliche Inhalte dieser Website, einschliesslich Texte, Gestaltung und Grafiken, gehören der [LEGAL ENTITY NAME], sofern nicht anders angegeben. Jede Vervielfältigung bedarf unserer vorgängigen schriftlichen Zustimmung.',
            'Die Schriften Fraunces und Inter werden unter der SIL Open Font License verwendet.',
            'Die Landschaft beruht auf offenen Höhendaten: Terrain Tiles von Mapzen, bereitgestellt über das AWS Open Data Programm. EU-DEM layers produced using Copernicus data and information funded by the European Union.',
          ],
        },
      ],
    },
    privacy: {
      heading: 'Datenschutzerklärung',
      subheading: 'Stand: November 2026',
      sections: [
        {
          heading: 'Überblick',
          body: [
            'Diese Datenschutzerklärung erläutert, wie die [LEGAL ENTITY NAME] («Alfine», «wir») im Zusammenhang mit dieser Website Personendaten bearbeitet. Wir bearbeiten so wenige Personendaten wie möglich, und zwar im Einklang mit dem Schweizer Bundesgesetz über den Datenschutz (DSG) und, soweit anwendbar, der Datenschutz-Grundverordnung der EU (DSGVO).',
          ],
        },
        {
          heading: 'Verantwortliche Stelle',
          address: ['[LEGAL ENTITY NAME]', '[STREET ADDRESS]', '[POSTCODE] Zug', 'Schweiz'],
          body: ['Für Fragen zum Datenschutz erreichen Sie uns unter {email}.'],
        },
        {
          heading: 'Besuch dieser Website',
          body: [
            'Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., USA. Beim Besuch der Website bearbeitet GitHub die technischen Daten, die für die Auslieferung und die Sicherheit der Website nötig sind, etwa Ihre IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite und Ihren Browsertyp. Wir erhalten diese Protokolle nicht und verwenden sie nicht, um Besucherinnen und Besucher zu identifizieren.',
          ],
        },
        {
          heading: 'Keine Cookies und kein Tracking',
          body: [
            'Diese Website verwendet keine Cookies, keine Analysewerkzeuge, keine Werbetechnologien, keine Social-Media-Plug-ins und keine anderen Tracking-Werkzeuge. Schriften und alle übrigen Ressourcen werden von unserer eigenen Domain ausgeliefert. Beim Laden einer Seite werden Ihre Daten daher nicht an Dritte wie Schrift- oder Content-Delivery-Anbieter weitergegeben.',
          ],
        },
        {
          heading: 'Kontaktformular und E-Mail',
          body: [
            'Wenn Sie uns über das Formular oder per E-Mail kontaktieren, bearbeiten wir die von Ihnen gemachten Angaben, etwa Ihren Namen, Ihre E-Mail-Adresse und Ihre Nachricht, ausschliesslich zur Bearbeitung Ihrer Anfrage.',
            'Über das Formular gesendete Nachrichten werden von Formspree, einem Dienst der Formspree, Inc., USA, übermittelt. Formspree leitet sie per E-Mail an uns weiter und bearbeitet die Daten in unserem Auftrag. Unsere E-Mails werden von [EMAIL PROVIDER NAME, COUNTRY] betrieben.',
            'Bitte geben Sie in Ihrer Nachricht keine besonders schützenswerten Personendaten an.',
          ],
        },
        {
          heading: 'Bekanntgabe ins Ausland',
          body: [
            'Einige der genannten Dienstleister haben ihren Sitz in den USA. Werden Personendaten in ein Land ohne angemessenes Datenschutzniveau bekanntgegeben, stützen wir uns auf geeignete Garantien, etwa die Zertifizierung des Anbieters unter dem Swiss-U.S. Data Privacy Framework, soweit vorhanden, oder auf vom Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) anerkannte Standardvertragsklauseln.',
          ],
        },
        {
          heading: 'Aufbewahrung',
          body: [
            'Wir bewahren Anfragen nur so lange auf, wie es für ihre Bearbeitung und zur Erfüllung gesetzlicher Aufbewahrungspflichten nötig ist. Danach werden sie gelöscht.',
          ],
        },
        {
          heading: 'Ihre Rechte',
          body: [
            'Im Rahmen des anwendbaren Rechts haben Sie das Recht, Auskunft über Ihre Personendaten zu verlangen, diese berichtigen oder löschen zu lassen, der Bearbeitung zu widersprechen und Ihre Daten in einem gängigen elektronischen Format zu erhalten. Um diese Rechte auszuüben, kontaktieren Sie uns bitte unter {email}.',
            'Zudem können Sie beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) oder, soweit die DSGVO anwendbar ist, bei einer Datenschutzaufsichtsbehörde in der Europäischen Union Beschwerde einreichen.',
          ],
        },
        {
          heading: 'Datensicherheit',
          body: [
            'Wir treffen angemessene technische und organisatorische Massnahmen zum Schutz von Personendaten. Diese Website wird ausschliesslich über eine verschlüsselte Verbindung (HTTPS) ausgeliefert.',
          ],
        },
        {
          heading: 'Änderungen',
          body: ['Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt die auf dieser Website veröffentlichte Fassung.'],
        },
      ],
    },
  },
};
