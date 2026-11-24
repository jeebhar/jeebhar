import { describe, expect, it } from 'vitest';

import { validateContactField, validateContactPayload } from './contact.validator';
import { emptyContactPayload } from '../../models/contact.model';

const valid = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  phone: '+91 90000 00000',
  subject: 'Campaign enquiry',
  body: 'We would like help launching our new outlet next month.',
};

describe('validateContactPayload', () => {
  it('returns no errors for a valid payload', () => {
    expect(validateContactPayload(valid)).toEqual({});
  });

  it('flags every field on an empty payload', () => {
    const errors = validateContactPayload(emptyContactPayload());

    expect(Object.keys(errors).sort()).toEqual(['body', 'email', 'name', 'phone', 'subject']);
  });

  it('treats whitespace-only input as missing', () => {
    const errors = validateContactPayload({
      name: '   ',
      email: '  ',
      phone: '   ',
      subject: '  ',
      body: '        ',
    });

    expect(Object.keys(errors)).toHaveLength(5);
  });
});

describe('validateContactField', () => {
  it.each([
    ['name', 'A', true],
    ['name', 'Al', false],
    ['email', 'nope', true],
    ['email', 'a@b.co', false],
    ['email', 'a@b', true],
    ['phone', '12345', true],
    ['phone', '+91 90000 00000', false],
    ['phone', 'call me', true],
    ['subject', 'hi', true],
    ['subject', 'Hey', false],
    ['body', 'too short', true],
    ['body', 'this is definitely long enough', false],
  ] as const)('%s = "%s" invalid: %s', (field, value, shouldFail) => {
    const message = validateContactField(field, value);
    expect(Boolean(message)).toBe(shouldFail);
  });
});
