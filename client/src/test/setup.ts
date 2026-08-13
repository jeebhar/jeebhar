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
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom has no IntersectionObserver; useActiveSection constructs one.
class MockIntersectionObserver implements IntersectionObserver {
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
