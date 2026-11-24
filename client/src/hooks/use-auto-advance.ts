import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Moves a carousel forward on a timer, and knows when NOT to.
 *
 * It holds still while the visitor is:
 *   - hovering over it, or has keyboard focus inside it
 *   - has just used the arrows or swiped (for `holdAfterInteractionMs`)
 *   - has pressed Pause
 *   - can't see it (scrolled away, or the browser tab is hidden)
 * and it starts paused for visitors who ask for reduced motion
 * (they can still press Play).
 *
 * Holding still while someone looks or reads, plus a visible Pause button,
 * is what WCAG 2.2.2 (Pause, Stop, Hide) asks of moving content.
 */

interface Options {
  /** Called on every tick, e.g. "go to the next card". */
  onTick: () => void;
  intervalMs?: number;
  holdAfterInteractionMs?: number;
}

interface AutoAdvance {
  /** True while the visitor has paused it with the button. */
  paused: boolean;
  togglePaused: () => void;
  /** Call after any manual navigation so the timer doesn't jump right after. */
  hold: () => void;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useAutoAdvance = (
  containerRef: RefObject<HTMLElement>,
  { onTick, intervalMs = 4000, holdAfterInteractionMs = 8000 }: Options
): AutoAdvance => {
  const [paused, setPaused] = useState<boolean>(prefersReducedMotion);
  const holdUntil = useRef(0);
  const hovering = useRef(false);
  const focused = useRef(false);
  const visible = useRef(true);

  // Keep the latest callback without restarting the timer on every render.
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  const hold = useCallback(() => {
    holdUntil.current = Date.now() + holdAfterInteractionMs;
  }, [holdAfterInteractionMs]);

  const togglePaused = useCallback(() => setPaused((current) => !current), []);

  // Hover, focus and touch on the carousel itself.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const listeners: Array<[string, EventListener]> = [
      ['mouseenter', () => (hovering.current = true)],
      ['mouseleave', () => (hovering.current = false)],
      ['focusin', () => (focused.current = true)],
      ['focusout', () => (focused.current = element.contains(document.activeElement))],
      ['pointerdown', hold],
      ['wheel', hold],
      ['touchstart', hold],
    ];
    listeners.forEach(([type, listener]) =>
      element.addEventListener(type, listener, { passive: true })
    );
    return () =>
      listeners.forEach(([type, listener]) => element.removeEventListener(type, listener));
  }, [containerRef, hold]);

  // Only move while it is on screen.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const rect = element.getBoundingClientRect();
    visible.current =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;
    const observer = new IntersectionObserver();
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      const busy =
        hovering.current ||
        focused.current ||
        !visible.current ||
        document.hidden ||
        Date.now() < holdUntil.current;
      if (!busy) tickRef.current();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs]);

  return { paused, togglePaused, hold };
};
