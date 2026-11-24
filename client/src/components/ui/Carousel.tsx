import { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from './Button';
import { useAutoAdvance } from '../../hooks/use-auto-advance';
import { useI18n } from '../../i18n';

/**
 * VIEW — a horizontally scrollable rail that moves on by itself.
 *
 * Generic over its items, so Work, Reels and Travel Reels share one
 * implementation. Every few seconds it moves one card forward and wraps back to
 * the start at the end. The ← / → buttons step one card (also wrapping), and
 * Pause stops the motion. When it holds still is decided in `useAutoAdvance`.
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
  /** Time between automatic moves. */
  intervalMs?: number;
}

/** Fallback when the card width can't be measured (e.g. before layout). */
const DEFAULT_STEP = 340;
/** Pixels of slack when deciding "we're at the end", for sub-pixel rounding. */
const EDGE = 8;

/** One card plus the gap after it — so each move lands exactly on a card. */
const stepOf = (rail: HTMLElement): number => {
  const first = rail.firstElementChild as HTMLElement | null;
  if (!first) return DEFAULT_STEP;
  const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
  return first.getBoundingClientRect().width + gap || DEFAULT_STEP;
};

export const Carousel = <T,>({
  items,
  keyOf,
  renderItem,
  label,
  emptyMessage = 'Nothing to show yet.',
  intervalMs,
}: CarouselProps<T>) => {
  const { t } = useI18n();
  const railRef = useRef<HTMLUListElement>(null);

  /** One card forward or back; wraps around at either end. */
  const move = useCallback((direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    if (max <= EDGE) return; // everything already fits on screen

    if (direction === 1 && rail.scrollLeft >= max - EDGE) {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === -1 && rail.scrollLeft <= EDGE) {
      rail.scrollTo({ left: max, behavior: 'smooth' });
    } else {
      rail.scrollBy({ left: direction * stepOf(rail), behavior: 'smooth' });
    }
  }, []);

  // Watch the rail only, not the controls: otherwise the Play button itself
  // (focused and hovered right after the click) would keep the rail still.
  const auto = useAutoAdvance(railRef, { onTick: () => move(1), intervalMs });

  const step = (direction: -1 | 1) => {
    auto.hold();
    move(direction);
  };

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
          aria-label={t(auto.paused ? 'carousel.play' : 'carousel.pause', { label })}
          onClick={() => {
            if (auto.paused) move(1); // visible feedback straight away
            auto.togglePaused();
          }}
        >
          <span aria-hidden="true">{auto.paused ? '▶' : '❚❚'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('carousel.back', { label })}
          onClick={() => step(-1)}
        >
          <span aria-hidden="true">&larr;</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('carousel.forward', { label })}
          onClick={() => step(1)}
        >
          <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </div>
  );
};
