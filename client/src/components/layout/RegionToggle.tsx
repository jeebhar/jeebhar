import { useI18n } from '../../i18n';
import { REGIONS, useRegion } from '../../region';

/**
 * VIEW — the All | Europe | India switch for Our Work, Reels and Travel Reels.
 *
 * A labelled group of toggle buttons (`aria-pressed`), like the language
 * switch, with a map-pin icon so the two switches are told apart at a glance.
 */
export const RegionToggle = ({ className = '' }: { className?: string }) => {
  const { t } = useI18n();
  const { region, setRegion } = useRegion();

  return (
    <div
      role="group"
      aria-label={t('region.label')}
      title={t('region.label')}
      className={`inline-flex items-center rounded-lg border border-white/15 p-0.5 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-1.5 h-3.5 w-3.5 shrink-0 text-accent"
        fill="currentColor"
      >
        <path d="M12 22s-7-6.6-7-12a7 7 0 0 1 14 0c0 5.4-7 12-7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
      {REGIONS.map((option) => {
        const active = option === region;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => setRegion(option)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
              active ? 'bg-accent text-white' : 'text-brand-100 hover:bg-white/10'
            }`}
          >
            {t(`region.${option}`)}
          </button>
        );
      })}
    </div>
  );
};
