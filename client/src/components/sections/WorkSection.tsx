import { Card, Carousel, Section } from '../ui';
import type { WorkItem } from '../../models/site-content.model';

interface WorkSectionProps {
  work: WorkItem[];
}

export const WorkSection = ({ work }: WorkSectionProps) => (
  <Section
    id="work"
    title="Our Work"
    description="Campaigns, content and brand refreshes we have shipped."
  >
    <Carousel
      items={work}
      label="Our work"
      emptyMessage="Case studies are on their way."
      keyOf={(item, index) => item._id ?? `${item.title}-${index}`}
      renderItem={(item) => (
        <Card as="div" className="h-full">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full bg-brand-800 object-cover"
          />
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-brand-200">{item.description}</p>
            )}
          </div>
        </Card>
      )}
    />
  </Section>
);
