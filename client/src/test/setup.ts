import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

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

class MockIntersectionObserver implements IntersectionObserver {
  scrollMargin!: string;
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
