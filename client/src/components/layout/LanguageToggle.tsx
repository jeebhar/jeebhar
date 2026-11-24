import { LANGUAGES, LANGUAGE_NAMES, useI18n } from '../../i18n';

/**
 * VIEW — the EN | DE switch in the header.
 *
 * A pair of toggle buttons (`aria-pressed`), so screen readers announce which
 * language is active and each button says which language it switches to.
 */
export const LanguageToggle = ({ className = '' }: { className?: string }) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`inline-flex rounded-lg border border-white/15 p-0.5 ${className}`}
    >
      {LANGUAGES.map((option) => {
        const active = option === language;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={t('language.switchTo', { language: LANGUAGE_NAMES[option].long })}
            onClick={() => setLanguage(option)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
              active ? 'bg-brand-cyan text-brand-900' : 'text-brand-100 hover:bg-white/10'
            }`}
          >
            {LANGUAGE_NAMES[option].short}
          </button>
        );
      })}
    </div>
  );
};
