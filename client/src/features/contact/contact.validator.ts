import type { ContactErrors, ContactPayload } from '../../models/contact.model';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[\d\s()+-]{7,40}$/;

type Rule = (value: string) => string | undefined;

const RULES: Record<keyof ContactPayload, Rule> = {
  name: (value) => (value.trim().length < 2 ? 'Please enter your name.' : undefined),
  email: (value) =>
    EMAIL_PATTERN.test(value.trim()) ? undefined : 'Please enter a valid email address.',
  phone: (value) =>
    PHONE_PATTERN.test(value.trim()) ? undefined : 'Please enter a valid phone number.',
  subject: (value) =>
    value.trim().length < 3 ? 'Please enter a subject of at least 3 characters.' : undefined,
  body: (value) =>
    value.trim().length < 10 ? 'Please write a message of at least 10 characters.' : undefined,
};

/** @returns a message for the field, or undefined when it is valid. */
export const validateContactField = (
  field: keyof ContactPayload,
  value: string
): string | undefined => RULES[field](value);

/** @returns a map of field -> message, empty when the whole payload is valid. */
export const validateContactPayload = (payload: ContactPayload): ContactErrors => {
  const errors: ContactErrors = {};

  (Object.keys(RULES) as Array<keyof ContactPayload>).forEach((field) => {
    const message = RULES[field](payload[field]);
    if (message) {
      errors[field] = message;
    }
  });

  return errors;
};
