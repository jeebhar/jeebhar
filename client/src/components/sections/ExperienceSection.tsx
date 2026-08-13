import { Card, Section } from '../ui';
import type { MediaMetric } from '../../models/site-content.model';

/** VIEW — media-kit headline numbers. */

interface ExperienceSectionProps {
  metrics: MediaMetric[];
}

export const ExperienceSection = ({ metrics }: ExperienceSectionProps) => (
  <Section
    id="experience"
    title="Our Experience"
    description="A snapshot of what we have delivered for restaurant and food brands."
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
