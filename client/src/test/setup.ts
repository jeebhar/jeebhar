import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Test bootstrap.
 *
 * Provides the browser APIs jsdom does not implement but the app relies on, and
 * unmounts components between tests so state never leaks across cases.
 */

// jsdom has no matchMedia; the header and scroll helper both query it.
// A plain function, not vi.fn(): `vi.restoreAllMocks()` below would strip a
// mock's implementation after the first test, and matchMedia() would then
// return undefined for every later test that renders the header.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// jsdom has no IntersectionObserver; useActiveSection constructs one.
// The constructor takes the same arguments as the real one, so code scanners
// (CodeQL) don't conclude that the callback passed in the app is superfluous.
class MockIntersectionObserver implements IntersectionObserver {
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {}

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof globalThis.IntersectionObserver;
}

// jsdom does not implement scrolling.
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollBy = vi.fn();
Element.prototype.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
