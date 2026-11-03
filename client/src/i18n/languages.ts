/**
 * Supported languages and how a visitor's first language is chosen.
 *
 * Pure functions, no React and no DOM, so the rules are unit-tested directly.
 */

export const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

/** What the toggle shows, and its name for screen readers. */
export const LANGUAGE_NAMES: Record<Language, { short: string; long: string }> = {
  en: { short: 'EN', long: 'English' },
  de: { short: 'DE', long: 'Deutsch' },
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);

interface DetectInput {
  /** The visitor's earlier choice from the toggle, if any. */
  stored: string | null;
  /** e.g. "www.jeebhar.de" */
  hostname: string;
  /** Host → default language, from jeebhar.config.json (domains.sites). */
  domainLanguages: Record<string, string>;
  /** navigator.languages */
  browserLanguages: readonly string[];
}

/**
 * First match wins:
 *   1. the visitor's own choice (they used the toggle before)
 *   2. the domain they came in on (jeebhar.de → Deutsch)
 *   3. their browser language
 *   4. English
 */
export const detectLanguage = ({
  stored,
  hostname,
  domainLanguages,
  browserLanguages,
}: DetectInput): Language => {
  if (isLanguage(stored)) {
    return stored;
  }

  const host = hostname.toLowerCase().replace(/^www\./, '');
  const byDomain = domainLanguages[host] ?? (host.endsWith('.de') ? 'de' : undefined);
  if (isLanguage(byDomain)) {
    return byDomain;
  }

  // Only trust the browser on a domain with no configured default.
  if (!(host in domainLanguages)) {
    const fromBrowser = browserLanguages
      .map((tag) => tag.slice(0, 2).toLowerCase())
      .find(isLanguage);
    if (fromBrowser) {
      return fromBrowser;
    }
  }

  return 'en';
};
