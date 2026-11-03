import { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from './Button';
import { useI18n } from '../../i18n';

/**
 * VIEW — a horizontally scrollable rail with keyboard-reachable arrows.
 *
 * Generic over its items, so Work and Reels share one implementation instead of
 * two near-identical blocks (the duplication this replaces).
 */

interface CarouselProps<T> {
  /**
   * Tolerates null/undefined on purpose: a content document written before a
   * collection existed arrives without that field, and a missing rail must
   * render as empty rather than throw and blank the whole page.
   */
  items: readonly T[] | null | undefined;
  /** Stable identity for React's reconciler. */
  keyOf: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
  /** Announced to assistive tech, e.g. "Our work". */
  label: string;
  emptyMessage?: string;
}

const SCROLL_STEP = 340;

export const Carousel = <T,>({
  items,
  keyOf,
  renderItem,
  label,
  emptyMessage = 'Nothing to show yet.',
}: CarouselProps<T>) => {
  const { t } = useI18n();
  const railRef = useRef<HTMLUListElement>(null);

  const scroll = useCallback((direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  }, []);

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return <p className="text-brand-200">{emptyMessage}</p>;
  }

  return (
    <div className="relative">
      <ul
        ref={railRef}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
      >
        {safeItems.map((item, index) => (
          <li
            key={keyOf(item, index)}
            className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>

      <div className="mt-1 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label={t('carousel.back', { label })}
          onClick={() => scroll(-1)}
        >
          <span aria-hidden="true">&larr;</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('carousel.forward', { label })}
          onClick={() => scroll(1)}
        >
          <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </div>
  );
};
