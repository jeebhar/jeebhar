/**
 * Every fixed piece of interface text, in both languages.
 *
 * `en` is the reference. `de` is typed as `Messages`, so a key missing from the
 * German dictionary is a COMPILE error — a half-translated page cannot ship.
 *
 * Content the owner edits (hero text, services, work, reels, stats) is NOT here;
 * it is translated in the content editor and stored with the content.
 *
 * Placeholders like {year} are filled in by `t('key', { year: 2026 })`.
 */

const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.services': 'Our Services',
  'nav.work': 'Our Work',
  'nav.reels': 'Our Reels',
  'nav.contact': 'Contact Us',
  'nav.mediaKit': 'Media Kit',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.main': 'Main',
  'nav.backToTop': '{brand} — back to top',
  'nav.skipToContent': 'Skip to content',
  'language.label': 'Language',
  'language.switchTo': 'Switch to {language}',

  // Hero
  'hero.cta': 'Let’s reimagine your business',
  'hero.mediaKit': 'View media kit',

  // Sections
  'services.title': 'Our Services',
  'services.description': 'Four ways we grow restaurant brands — tap any card to read the detail.',
  'experience.title': 'Our Experience',
  'experience.description': 'A snapshot of what we have delivered for restaurant and food brands.',
  'work.title': 'Our Work',
  'work.description':
    'The cuisines we shoot, style and campaign for — from dosa counters to beer halls.',
  'work.empty': 'Case studies are on their way.',
  'reels.title': 'Our Reels',
  'reels.description': 'Food vlogs and restaurant ad creatives that earned the scroll-stop.',
  'reels.badge': 'Food & ads',
  'reels.empty': 'Reels are coming soon.',
  'reels.watch': 'Watch on Instagram',
  'travel.title': 'Travel Reels',
  'travel.description': 'Destination and travel storytelling, shot and edited in house.',
  'travel.badge': 'Travel',
  'travel.empty': 'Travel reels are coming soon.',
  'carousel.back': 'Scroll {label} backwards',
  'carousel.forward': 'Scroll {label} forwards',
  'carousel.pause': 'Pause {label}',
  'carousel.play': 'Play {label}',
  'section.failed': '{label} could not be displayed.',

  // Contact
  'contact.title': 'Contact Us',
  'contact.description': 'Tell us about your restaurant and what you want to achieve.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.phone': 'Phone number',
  'contact.subject': 'Subject',
  'contact.body': 'Message',
  'contact.bodyPlaceholder': 'What are you working on, and what does success look like?',
  'contact.send': 'Send enquiry',
  'contact.sending': 'Sending…',
  'contact.direct': 'Prefer to reach us directly?',
  'contact.success': 'Thanks — your enquiry has been received. We will be in touch shortly.',
  'contact.fixFields': 'Please correct the highlighted fields.',
  'contact.failed': 'Unable to send your enquiry. Please try again.',
  'contact.error.name': 'Please enter your name.',
  'contact.error.email': 'Please enter a valid email address.',
  'contact.error.phone': 'Please enter a valid phone number.',
  'contact.error.subject': 'Please enter a subject of at least 3 characters.',
  'contact.error.body': 'Please write a message of at least 10 characters.',

  // Footer
  'footer.tagline': 'Social media marketing for restaurants and food brands',
  'footer.contact': 'Contact',
  'footer.follow': 'Follow',
  'footer.rights': '© {year} {brand}. All rights reserved.',

  // Page states
  'page.loading': 'Loading…',
  'page.loadFailed': 'We could not load the site',
  'page.retry': 'Try again',

  // Document
  'meta.title': 'Jeebhar — Social media marketing for restaurants and food brands',
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const de: Messages = {
  'nav.home': 'Start',
  'nav.services': 'Leistungen',
  'nav.work': 'Unsere Arbeit',
  'nav.reels': 'Unsere Reels',
  'nav.contact': 'Kontakt',
  'nav.mediaKit': 'Media Kit',
  'nav.menu': 'Menü',
  'nav.close': 'Schließen',
  'nav.main': 'Hauptmenü',
  'nav.backToTop': '{brand} — nach oben',
  'nav.skipToContent': 'Zum Inhalt springen',
  'language.label': 'Sprache',
  'language.switchTo': 'Zu {language} wechseln',

  'hero.cta': 'Lassen Sie uns Ihr Business neu denken',
  'hero.mediaKit': 'Media Kit ansehen',

  'services.title': 'Unsere Leistungen',
  'services.description':
    'Vier Wege, wie wir Restaurantmarken wachsen lassen — tippen Sie auf eine Karte für Details.',
  'experience.title': 'Unsere Erfahrung',
  'experience.description': 'Ein Überblick über unsere Ergebnisse für Restaurants und Food-Marken.',
  'work.title': 'Unsere Arbeit',
  'work.description':
    'Die Küchen, die wir fotografieren, stylen und bewerben — vom Dosa-Stand bis zum Brauhaus.',
  'work.empty': 'Referenzen folgen in Kürze.',
  'reels.title': 'Unsere Reels',
  'reels.description': 'Food-Vlogs und Restaurant-Werbung, bei denen man nicht weiterscrollt.',
  'reels.badge': 'Food & Werbung',
  'reels.empty': 'Reels folgen in Kürze.',
  'reels.watch': 'Auf Instagram ansehen',
  'travel.title': 'Reise-Reels',
  'travel.description': 'Reise- und Destinations-Storytelling, selbst gedreht und geschnitten.',
  'travel.badge': 'Reisen',
  'travel.empty': 'Reise-Reels folgen in Kürze.',
  'carousel.back': '{label} zurückblättern',
  'carousel.forward': '{label} vorblättern',
  'carousel.pause': '{label} anhalten',
  'carousel.play': '{label} abspielen',
  'section.failed': '{label} konnte nicht angezeigt werden.',

  'contact.title': 'Kontakt',
  'contact.description': 'Erzählen Sie uns von Ihrem Restaurant und Ihren Zielen.',
  'contact.name': 'Name',
  'contact.email': 'E-Mail',
  'contact.phone': 'Telefonnummer',
  'contact.subject': 'Betreff',
  'contact.body': 'Nachricht',
  'contact.bodyPlaceholder': 'Woran arbeiten Sie, und wie sieht Erfolg für Sie aus?',
  'contact.send': 'Anfrage senden',
  'contact.sending': 'Wird gesendet…',
  'contact.direct': 'Lieber direkt Kontakt aufnehmen?',
  'contact.success': 'Danke — Ihre Anfrage ist eingegangen. Wir melden uns in Kürze.',
  'contact.fixFields': 'Bitte korrigieren Sie die markierten Felder.',
  'contact.failed': 'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
  'contact.error.name': 'Bitte geben Sie Ihren Namen ein.',
  'contact.error.email': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
  'contact.error.phone': 'Bitte geben Sie eine gültige Telefonnummer ein.',
  'contact.error.subject': 'Bitte geben Sie einen Betreff mit mindestens 3 Zeichen ein.',
  'contact.error.body': 'Bitte schreiben Sie eine Nachricht mit mindestens 10 Zeichen.',

  'footer.tagline': 'Social-Media-Marketing für Restaurants und Food-Marken',
  'footer.contact': 'Kontakt',
  'footer.follow': 'Folgen',
  'footer.rights': '© {year} {brand}. Alle Rechte vorbehalten.',

  'page.loading': 'Wird geladen…',
  'page.loadFailed': 'Die Seite konnte nicht geladen werden',
  'page.retry': 'Erneut versuchen',

  'meta.title': 'Jeebhar — Social-Media-Marketing für Restaurants und Food-Marken',
};

export const MESSAGES = { en, de } as const satisfies Record<string, Messages>;
