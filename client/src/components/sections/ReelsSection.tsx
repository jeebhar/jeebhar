import { Card, Carousel, Section } from '../ui';
import type { ReelItem } from '../../models/site-content.model';

interface ReelsSectionProps {
  reels: ReelItem[];
}

export const ReelsSection = ({ reels }: ReelsSectionProps) => (
  <Section id="reels" title="Our Reels" description="Short-form work that earned the scroll-stop.">
    <Carousel
      items={reels}
      label="Our reels"
      emptyMessage="Reels are coming soon."
      keyOf={(reel, index) => reel._id ?? `${reel.title}-${index}`}
      renderItem={(reel) => (
        <Card as="a" href={reel.instagramUrl} interactive className="group h-full">
          <div className="relative">
            <img
              src={reel.thumbnailUrl}
              alt={reel.title}
              loading="lazy"
              decoding="async"
              className="aspect-[9/12] w-full bg-brand-800 object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-brand-950/25 text-4xl text-white/90 opacity-0 transition group-hover:opacity-100"
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
