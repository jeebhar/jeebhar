import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { contactSubmissionSchema } from '../src/validators/contact.validator.js';
import { siteContentSchema } from '../src/validators/content.validator.js';

const validContact = {
  name: 'Asha Rao',
  email: '  ASHA@Example.COM ',
  phone: '+91 90000 00000',
  subject: 'Campaign enquiry',
  body: 'We would like help launching our new outlet next month.',
};

describe('contactSubmissionSchema', () => {
  it('accepts a valid submission and normalises the email', () => {
    const result = contactSubmissionSchema.safeParse(validContact);

    assert.equal(result.success, true);
    assert.equal(result.data.email, 'asha@example.com');
  });

  it('rejects a short name, bad email, bad phone, short subject and short body', () => {
    const cases = [
      ['name', 'A'],
      ['email', 'not-an-email'],
      ['phone', 'call-me'],
      ['subject', 'hi'],
      ['body', 'too short'],
    ];

    for (const [field, value] of cases) {
      const result = contactSubmissionSchema.safeParse({ ...validContact, [field]: value });
      assert.equal(result.success, false, `expected "${field}"="${value}" to be rejected`);
      assert.ok(
        result.error.issues.some((issue) => issue.path[0] === field),
        `expected an issue on "${field}"`
      );
    }
  });

  it('strips unknown keys so callers cannot smuggle extra fields into the model', () => {
    const result = contactSubmissionSchema.safeParse({ ...validContact, notified: true, _id: 'x' });

    assert.equal(result.success, true);
    assert.equal('notified' in result.data, false);
    assert.equal('_id' in result.data, false);
  });
});

const validContent = {
  brandName: 'Jeebhar',
  heroHeading: 'Heading',
  heroSubheading: 'Subheading',
  contact: {
    address: 'Somewhere',
    email: 'hello@jeebhar.com',
    phone: '+91-90000-00000',
  },
};

describe('siteContentSchema', () => {
  it('applies defaults for optional collections and URLs', () => {
    const result = siteContentSchema.safeParse(validContent);

    assert.equal(result.success, true);
    assert.deepEqual(result.data.work, []);
    assert.deepEqual(result.data.reels, []);
    assert.deepEqual(result.data.travelReels, []);
    assert.equal(result.data.contact.facebookUrl, '');
    assert.equal(result.data.mediaKitUrl, '/brand/media-kit.pdf');
  });

  it('accepts a root-relative image path as well as an absolute URL', () => {
    // Covers and photos can be self-hosted from client/public, so a bare
    // url() check would wrongly reject them.
    const result = siteContentSchema.safeParse({
      ...validContent,
      work: [{ title: 'South Indian', imageUrl: '/work/south-indian.jpg', description: '' }],
      reels: [
        {
          title: 'Food reel 01',
          thumbnailUrl: '/reels/DQWG611DCCr.jpg',
          instagramUrl: 'https://www.instagram.com/reel/DQWG611DCCr/',
        },
      ],
    });

    assert.equal(result.success, true);
    assert.equal(result.data.work[0].imageUrl, '/work/south-indian.jpg');
  });

  it('treats a reel cover as optional but still requires the Instagram link', () => {
    const withoutCover = siteContentSchema.safeParse({
      ...validContent,
      travelReels: [
        {
          title: 'Travel reel 01',
          instagramUrl: 'https://www.instagram.com/reel/DaiErQFgKyc/',
        },
      ],
    });

    assert.equal(withoutCover.success, true);
    assert.equal(withoutCover.data.travelReels[0].thumbnailUrl, '');

    const withoutLink = siteContentSchema.safeParse({
      ...validContent,
      travelReels: [{ title: 'Travel reel 01', thumbnailUrl: '/reels/x.jpg' }],
    });

    assert.equal(withoutLink.success, false);
  });

  it('rejects an image reference that is neither a URL nor a rooted path', () => {
    const result = siteContentSchema.safeParse({
      ...validContent,
      work: [{ title: 'South Indian', imageUrl: 'work/south-indian.jpg', description: '' }],
    });

    assert.equal(result.success, false);
  });

  it('rejects a work item whose image URL is not a URL', () => {
    const result = siteContentSchema.safeParse({
      ...validContent,
      work: [{ title: 'Item', imageUrl: 'nope', description: '' }],
    });

    assert.equal(result.success, false);
  });

  it('rejects content missing required contact details', () => {
    const result = siteContentSchema.safeParse({ ...validContent, contact: {} });

    assert.equal(result.success, false);
  });
});
