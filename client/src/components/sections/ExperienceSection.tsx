import { Card, Section } from '../ui';
import type { MediaMetric } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/** VIEW — media-kit headline numbers. */

interface ExperienceSectionProps {
  metrics: MediaMetric[];
}

export const ExperienceSection = ({ metrics }: ExperienceSectionProps) => {
  const { t } = useI18n();
  return (
    <Section
      id="experience"
      title={t('experience.title')}
      description={t('experience.description')}
    >
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric._id ?? metric.label} as="div" className="p-6">
            <dt className="order-2 mt-2 text-sm text-brand-200">{metric.label}</dt>
            <dd className="order-1 text-3xl font-extrabold tracking-tight text-brand-cyan md:text-4xl">
              {metric.value}
            </dd>
          </Card>
        ))}
      </dl>
    </Section>
  );
};
