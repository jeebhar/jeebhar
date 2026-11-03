import { useCallback, useMemo, useState } from 'react';

import { submitContactEnquiry } from '../api/contact.api';
import { validateContactField, validateContactPayload } from '../contact.validator';
import { emptyContactPayload } from '../../../models/contact.model';
import type {
  ContactErrorKeys,
  ContactErrors,
  ContactField,
  ContactPayload,
} from '../../../models/contact.model';
import { useI18n } from '../../../i18n';
import type { MessageKey } from '../../../i18n';
import { ApiError } from '../../../services/http-client';
import { toErrorMessage, toFieldErrors } from '../../../utils/error';

/**
 * CONTROLLER (hook) — everything the contact form does.
 *
 * Holds the values, per-field errors, submit state and the outcome banner. The
 * form component below it is a pure view: inputs bound to `values`, one call to
 * `submit`.
 *
 * Errors and the banner are stored as message KEYS and translated on the way
 * out, so they follow the language toggle. The one exception is an unexpected
 * server message (e.g. "Too many requests"), which is shown as the server sent it.
 */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type Feedback = { key: MessageKey } | { text: string } | null;

interface UseContactFormResult {
  values: ContactPayload;
  errors: ContactErrors;
  state: SubmitState;
  feedback: string;
  setField: (field: ContactField, value: string) => void;
  /** The value is passed in explicitly so this stays a pure state update. */
  blurField: (field: ContactField, value: string) => void;
  submit: () => Promise<void>;
}

const FIELDS: readonly ContactField[] = ['name', 'email', 'phone', 'subject', 'body'];

export const useContactForm = (): UseContactFormResult => {
  const { t } = useI18n();
  const [values, setValues] = useState<ContactPayload>(emptyContactPayload);
  const [errorKeys, setErrorKeys] = useState<ContactErrorKeys>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const setField = useCallback((field: ContactField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    setErrorKeys((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  }, []);

  const blurField = useCallback((field: ContactField, value: string) => {
    // Takes the value as an argument rather than reading it inside a setValues
    // updater: updaters must be pure, and StrictMode replays them.
    setErrorKeys((previous) => ({ ...previous, [field]: validateContactField(field, value) }));
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateContactPayload(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrorKeys(validationErrors);
      setState('error');
      setFeedback({ key: 'contact.fixFields' });
      return;
    }

    setState('submitting');
    setFeedback(null);

    try {
      await submitContactEnquiry(values);
      setValues(emptyContactPayload());
      setErrorKeys({});
      setState('success');
      setFeedback({ key: 'contact.success' });
    } catch (error) {
      // The server validates independently. Its field list is mapped back onto
      // our own translated messages rather than shown in English.
      const serverFields = Object.keys(toFieldErrors(error)).filter(
        (field): field is ContactField => (FIELDS as readonly string[]).includes(field)
      );
      if (serverFields.length > 0) {
        setErrorKeys(
          Object.fromEntries(serverFields.map((field) => [field, `contact.error.${field}`]))
        );
        setFeedback({ key: 'contact.fixFields' });
      } else if (error instanceof ApiError && error.status > 0 && error.status !== 500) {
        setFeedback({ text: toErrorMessage(error, '') || t('contact.failed') });
      } else {
        setFeedback({ key: 'contact.failed' });
      }
      setState('error');
    }
  }, [values, t]);

  const errors = useMemo<ContactErrors>(
    () =>
      Object.fromEntries(
        Object.entries(errorKeys)
          .filter((entry): entry is [ContactField, MessageKey] => Boolean(entry[1]))
          .map(([field, key]) => [field, t(key)])
      ),
    [errorKeys, t]
  );

  const feedbackText = feedback === null ? '' : 'key' in feedback ? t(feedback.key) : feedback.text;

  return { values, errors, state, feedback: feedbackText, setField, blurField, submit };
};
