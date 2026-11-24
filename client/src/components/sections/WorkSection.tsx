import { Card, Carousel, MediaCover, Section } from '../ui';
import type { WorkItem } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/** VIEW — the cuisines we produce content for, as a scrollable rail of cards. */

interface WorkSectionProps {
  work: WorkItem[];
}

export const WorkSection = ({ work }: WorkSectionProps) => {
  const { t } = useI18n();
  return (
    <Section id="work" title={t('work.title')} description={t('work.description')}>
      <Carousel
        items={work}
        label={t('work.title')}
        emptyMessage={t('work.empty')}
        keyOf={(item, index) => item._id ?? `${item.title}-${index}`}
        renderItem={(item) => (
          <Card as="div" className="flex h-full flex-col">
            <MediaCover
              src={item.imageUrl}
              title={item.title}
              aspect="landscape"
              showPlayIcon={false}
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
};
