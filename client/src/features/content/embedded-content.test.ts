import { afterEach, describe, expect, it } from 'vitest';

import { readEmbeddedContent } from './embedded-content';

const embed = (text: string) => {
  const script = document.createElement('script');
  script.id = 'jeebhar-content';
  script.type = 'application/json';
  script.textContent = text;
  document.body.appendChild(script);
};

afterEach(() => document.getElementById('jeebhar-content')?.remove());

describe('readEmbeddedContent', () => {
  it('returns the content the server embedded in the page', () => {
    embed('{"brandName":"Jeebhar","heroHeading":{"en":"Hi","de":"Hallo"}}');
    expect(readEmbeddedContent()).toMatchObject({ brandName: 'Jeebhar' });
  });

  it('decodes the HTML-safe escapes PHP uses inside the script tag', () => {
    embed('{"brandName":"A \\u0026 B \\u003C\\/script\\u003E"}');
    expect(readEmbeddedContent()?.brandName).toBe('A & B </script>');
  });

  it('returns null without the tag (development) or with broken JSON', () => {
    expect(readEmbeddedContent()).toBeNull();
    embed('{not json');
    expect(readEmbeddedContent()).toBeNull();
  });
});
