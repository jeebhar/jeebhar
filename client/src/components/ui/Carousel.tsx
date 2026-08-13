import { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from './Button';

interface CarouselProps<T> {
  items: readonly T[];
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
  const railRef = useRef<HTMLUListElement>(null);

  const scroll = useCallback((direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  }, []);

  if (items.length === 0) {
    return <p className="text-brand-200">{emptyMessage}</p>;
  }

  return (
    <div className="relative">
      <ul
        ref={railRef}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
      >
        {items.map((item, index) => (
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
          aria-label={`Scroll ${label} backwards`}
          onClick={() => scroll(-1)}
        >
          <span aria-hidden="true">&larr;</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Scroll ${label} forwards`}
          onClick={() => scroll(1)}
        >
          <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </div>
  );
};
