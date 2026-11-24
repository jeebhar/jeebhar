import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { appConfig } from '../config/app.config';
import { detectLanguage } from './languages';
import type { Language } from './languages';
import { I18nContext, translate } from './context';
import type { I18nValue } from './context';

/**
 * Holds the current language and exposes `t()` for interface text.
 *
 *   const { t, language, setLanguage } = useI18n();
 *   t('nav.home')                         → "Home" / "Start"
 *   t('footer.rights', { year: 2026 })    → fills {year}
 *
 * The choice is remembered in localStorage (best effort — private windows may
 * refuse, which is fine) and mirrored to <html lang> and the tab title.
 */

const STORAGE_KEY = 'jeebhar.language';

const readStored = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const initialLanguage = (): Language =>
  detectLanguage({
    stored: readStored(),
    hostname: window.location.hostname,
    domainLanguages: appConfig.domainLanguages,
    browserLanguages: navigator.languages ?? [navigator.language],
  });

interface I18nProviderProps {
  children: ReactNode;
  /** Forces a language (tests, previews). */
  initial?: Language;
}

export const I18nProvider = ({ children, initial }: I18nProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => initial ?? initialLanguage());

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice still applies for this visit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, 'meta.title');
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({ language, setLanguage, t: (key, params) => translate(language, key, params) }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
