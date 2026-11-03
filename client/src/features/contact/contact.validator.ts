import type { ContactErrorKeys, ContactPayload } from '../../models/contact.model';
import type { MessageKey } from '../../i18n/messages';

/**
 * Client-side mirror of the server's contact rules.
 *
 * Pure functions with no React and no DOM, so they are trivially unit-testable.
 * The server validates independently — this exists to give instant feedback,
 * never as the security boundary.
 *
 * Rules return a message KEY, not text, so the error is shown in whichever
 * language the visitor has selected — even if they switch after it appears.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[\d\s()+-]{7,40}$/;

type Rule = (value: string) => MessageKey | undefined;

const RULES: Record<keyof ContactPayload, Rule> = {
  name: (value) => (value.trim().length < 2 ? 'contact.error.name' : undefined),
  email: (value) => (EMAIL_PATTERN.test(value.trim()) ? undefined : 'contact.error.email'),
  phone: (value) => (PHONE_PATTERN.test(value.trim()) ? undefined : 'contact.error.phone'),
  subject: (value) => (value.trim().length < 3 ? 'contact.error.subject' : undefined),
  body: (value) => (value.trim().length < 10 ? 'contact.error.body' : undefined),
};

/** @returns a message key for the field, or undefined when it is valid. */
export const validateContactField = (
  field: keyof ContactPayload,
  value: string
): MessageKey | undefined => RULES[field](value);

/** @returns a map of field -> message key, empty when the whole payload is valid. */
export const validateContactPayload = (payload: ContactPayload): ContactErrorKeys => {
  const errors: ContactErrorKeys = {};

  (Object.keys(RULES) as Array<keyof ContactPayload>).forEach((field) => {
    const message = RULES[field](payload[field]);
    if (message) {
      errors[field] = message;
    }
  });

  return errors;
};
