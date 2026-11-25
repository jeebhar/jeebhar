import type { ReactNode } from 'react';
import { Card, Carousel, MediaCover, Section } from '../ui';
import type { ReelItem } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/**
 * VIEW — a rail of Instagram reels; each card opens the reel in a new tab.
 *
 * Deliberately parameterised rather than hard-wired to one collection, so the
 * food and travel sections are two usages of this component instead of two
 * near-identical files.
 */

interface ReelsSectionProps {
  /** Anchor id; must match an entry in config/navigation.ts. */
  id: string;
  title: string;
  description: string;
  reels: ReelItem[];
  /** Short label shown on cover tiles, e.g. "Food & ads". */
  badge?: string;
  emptyMessage?: ReactNode;
}

export const ReelsSection = ({
  id,
  title,
  description,
  reels,
  badge,
  emptyMessage,
}: ReelsSectionProps) => {
  const { t } = useI18n();
  return (
    <Section id={id} title={title} description={description}>
      <Carousel
        items={reels}
        label={title}
        emptyMessage={emptyMessage ?? t('reels.empty')}
        keyOf={(reel, index) => reel._id ?? `${reel.instagramUrl}-${index}`}
        renderItem={(reel) => (
          <Card as="a" href={reel.instagramUrl} interactive className="group h-full">
            <MediaCover src={reel.thumbnailUrl} title={reel.title} badge={badge} />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white">{reel.title}</h3>
              <p className="mt-1 text-sm text-brand-cyan">{t('reels.watch')} &rarr;</p>
            </div>
          </Card>
        )}
      />
    </Section>
  );
};
