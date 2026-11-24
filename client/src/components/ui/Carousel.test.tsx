import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Carousel } from './Carousel';

/**
 * jsdom has no layout, so the rail's sizes are set by hand: 3 cards of 300px
 * in a 400px-wide viewport, i.e. it overflows and can move.
 */
const layout = (scrollLeft = 0) => {
  const rail = screen.getByRole('list', { name: 'Our work' });
  Object.defineProperties(rail, {
    scrollWidth: { configurable: true, value: 900 },
    clientWidth: { configurable: true, value: 400 },
    scrollLeft: { configurable: true, writable: true, value: scrollLeft },
  });
  rail.scrollBy = vi.fn();
  rail.scrollTo = vi.fn();
  return rail;
};

const renderCarousel = () =>
  render(
    <Carousel
      items={['a', 'b', 'c']}
      keyOf={(item) => item}
      renderItem={(item) => <span>{item}</span>}
      label="Our work"
      intervalMs={1000}
    />
  );

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Carousel', () => {
  it('moves forward on its own', () => {
    renderCarousel();
    const rail = layout();

    act(() => vi.advanceTimersByTime(1000));

    expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  it('wraps back to the first card at the end', () => {
    renderCarousel();
    const rail = layout(500);

    act(() => vi.advanceTimersByTime(1000));

    expect(rail.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
  });

  it('the back arrow on the first card jumps to the last', () => {
    renderCarousel();
    const rail = layout(0);

    fireEvent.click(screen.getByRole('button', { name: /backwards/i }));

    expect(rail.scrollTo).toHaveBeenCalledWith({ left: 500, behavior: 'smooth' });
  });

  it('holds still for a while after the visitor uses the arrows', () => {
    renderCarousel();
    const rail = layout(100);

    fireEvent.click(screen.getByRole('button', { name: /forwards/i }));
    expect(rail.scrollBy).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(3000));
    expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  it('holds still while hovered', () => {
    const { container } = renderCarousel();
    const rail = layout();

    fireEvent.mouseEnter(container.firstElementChild as Element);
    act(() => vi.advanceTimersByTime(3000));

    expect(rail.scrollBy).not.toHaveBeenCalled();
  });

  it('stops when paused and starts again on play', () => {
    renderCarousel();
    const rail = layout();

    fireEvent.click(screen.getByRole('button', { name: 'Pause Our work' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(rail.scrollBy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Play Our work' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  it('starts paused for visitors who prefer reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => ({ matches: query.includes('reduce') }) as MediaQueryList
    );
    renderCarousel();
    const rail = layout();

    act(() => vi.advanceTimersByTime(3000));

    expect(rail.scrollBy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Play Our work' })).toBeInTheDocument();
  });
});
