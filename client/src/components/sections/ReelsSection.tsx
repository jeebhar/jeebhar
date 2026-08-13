import { Card, Carousel, MediaCover, Section } from '../ui';
import type { ReelItem } from '../../models/site-content.model';

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
  emptyMessage?: string;
}

export const ReelsSection = ({
  id,
  title,
  description,
  reels,
  badge,
  emptyMessage = 'Reels are coming soon.',
}: ReelsSectionProps) => (
  <Section id={id} title={title} description={description}>
    <Carousel
      items={reels}
      label={title}
      emptyMessage={emptyMessage}
      keyOf={(reel, index) => reel._id ?? `${reel.instagramUrl}-${index}`}
      renderItem={(reel) => (
        <Card as="a" href={reel.instagramUrl} interactive className="group h-full">
          <div className="relative">
            <MediaCover src={reel.thumbnailUrl} title={reel.title} badge={badge} />
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-brand-950/30 text-4xl text-white/90 opacity-0 transition group-hover:opacity-100"
            >
              &#9658;
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white">{reel.title}</h3>
            <p className="mt-1 text-sm text-brand-cyan">Watch on Instagram &rarr;</p>
          </div>
        </Card>
      )}
    />
  </Section>
);
