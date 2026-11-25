import { useI18n } from '../../i18n';
import { useRegion } from '../../region';

/**
 * VIEW — shown in a rail when the chosen region has nothing yet, with a way
 * out, instead of an empty section that looks broken.
 */
export const RegionEmpty = () => {
  const { t } = useI18n();
  const { region, setRegion } = useRegion();
  return (
    <p className="flex flex-wrap items-center gap-3">
      <span>{t('region.empty', { region: t(`region.${region}`) })}</span>
      <button
        type="button"
        onClick={() => setRegion('all')}
        className="rounded-lg border border-brand-cyan/60 px-3 py-1.5 text-sm font-semibold text-brand-cyan transition hover:bg-brand-cyan/10"
      >
        {t('region.showAll')}
      </button>
    </p>
  );
};
