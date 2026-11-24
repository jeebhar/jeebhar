import { describe, expect, it } from 'vitest';

import { resolveMediaKitUrl } from './content';

/**
 * Regression test: an `<a>` whose href is undefined renders as a link that does
 * nothing when clicked, with no error to explain it. The Media Kit link hit this
 * when the content document had no `mediaKitUrl`.
 */
describe('resolveMediaKitUrl', () => {
  it('uses the value from the content document', () => {
    expect(resolveMediaKitUrl('/brand/custom.pdf')).toBe('/brand/custom.pdf');
  });

  it('falls back when the field is missing', () => {
    expect(resolveMediaKitUrl(undefined)).toBe('/brand/media-kit.pdf');
    expect(resolveMediaKitUrl(null)).toBe('/brand/media-kit.pdf');
  });

  it('falls back for a blank or whitespace-only value', () => {
    expect(resolveMediaKitUrl('')).toBe('/brand/media-kit.pdf');
    expect(resolveMediaKitUrl('   ')).toBe('/brand/media-kit.pdf');
  });

  it('never returns an empty string, so the href is always usable', () => {
    for (const input of [undefined, null, '', ' ', '\t']) {
      expect(resolveMediaKitUrl(input).length).toBeGreaterThan(0);
    }
  });

  it('accepts an absolute URL unchanged', () => {
    expect(resolveMediaKitUrl('https://cdn.example.com/kit.pdf')).toBe(
      'https://cdn.example.com/kit.pdf'
    );
  });
});
