import { createContext, useContext } from 'react';

import type { Language } from './languages';
import { MESSAGES } from './messages';
import type { MessageKey } from './messages';

/**
 * The i18n context and `useI18n()` — kept apart from the provider component so
 * React fast refresh works (a component file should only export components).
 */

export type Params = Record<string, string | number>;

export interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: Params) => string;
}

export const translate = (language: Language, key: MessageKey, params?: Params): string => {
  const template: string = MESSAGES[language][key] ?? MESSAGES.en[key];
  return params
    ? template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
    : template;
};

/** English without a provider, so components render in isolation (and in tests). */
export const I18nContext = createContext<I18nValue>({
  language: 'en',
  setLanguage: () => undefined,
  t: (key, params) => translate('en', key, params),
});

export const useI18n = (): I18nValue => useContext(I18nContext);
