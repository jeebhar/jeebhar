import { describe, expect, it } from 'vitest';

import { detectLanguage } from './languages';

const domains = { 'jeebhar.com': 'en', 'jeebhar.in': 'en', 'jeebhar.de': 'de' };
const detect = (overrides: Partial<Parameters<typeof detectLanguage>[0]> = {}) =>
  detectLanguage({
    stored: null,
    hostname: 'jeebhar.com',
    domainLanguages: domains,
    browserLanguages: ['en-US'],
    ...overrides,
  });

describe('detectLanguage', () => {
  it('opens jeebhar.de in German and jeebhar.com / .in in English', () => {
    expect(detect({ hostname: 'jeebhar.de' })).toBe('de');
    expect(detect({ hostname: 'www.jeebhar.de' })).toBe('de');
    expect(detect({ hostname: 'jeebhar.com', browserLanguages: ['de-DE'] })).toBe('en');
    expect(detect({ hostname: 'jeebhar.in' })).toBe('en');
  });

  it("always prefers the visitor's own earlier choice", () => {
    expect(detect({ hostname: 'jeebhar.de', stored: 'en' })).toBe('en');
    expect(detect({ hostname: 'jeebhar.com', stored: 'de' })).toBe('de');
  });

  it('ignores a corrupted stored value', () => {
    expect(detect({ hostname: 'jeebhar.de', stored: 'fr' })).toBe('de');
  });

  it('uses the browser language on an unconfigured host such as localhost', () => {
    expect(detect({ hostname: 'localhost', browserLanguages: ['de-AT', 'en'] })).toBe('de');
    expect(detect({ hostname: 'localhost', browserLanguages: ['fr-FR'] })).toBe('en');
  });

  it('treats any .de host as German even without config', () => {
    expect(detect({ hostname: 'preview.jeebhar.de', domainLanguages: {} })).toBe('de');
  });
});
