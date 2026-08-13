import { useCallback, useState } from 'react';

import { submitContactEnquiry } from '../api/contact.api';
import { validateContactField, validateContactPayload } from '../contact.validator';
import { emptyContactPayload } from '../../../models/contact.model';
import type { ContactErrors, ContactField, ContactPayload } from '../../../models/contact.model';
import { toErrorMessage, toFieldErrors } from '../../../utils/error';

/**
 * CONTROLLER (hook) — everything the contact form does.
 *
 * Holds the values, per-field errors, submit state and the outcome banner. The
 * form component below it is a pure view: inputs bound to `values`, one call to
 * `submit`.
 */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

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

export const useContactForm = (): UseContactFormResult => {
  const [values, setValues] = useState<ContactPayload>(emptyContactPayload);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [feedback, setFeedback] = useState('');

  const setField = useCallback((field: ContactField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  }, []);

  const blurField = useCallback((field: ContactField, value: string) => {
    // Takes the value as an argument rather than reading it inside a setValues
    // updater: updaters must be pure, and StrictMode replays them.
    setErrors((previous) => ({ ...previous, [field]: validateContactField(field, value) }));
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateContactPayload(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setState('error');
      setFeedback('Please correct the highlighted fields.');
      return;
    }

    setState('submitting');
    setFeedback('');

    try {
      await submitContactEnquiry(values);
      setValues(emptyContactPayload());
      setErrors({});
      setState('success');
      setFeedback('Thanks — your enquiry has been received. We will be in touch shortly.');
    } catch (error) {
      // The server validates independently; surface its field messages too.
      const serverFieldErrors = toFieldErrors(error);
      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors(serverFieldErrors as ContactErrors);
      }
      setState('error');
      setFeedback(toErrorMessage(error, 'Unable to send your enquiry. Please try again.'));
    }
  }, [values]);

  return { values, errors, state, feedback, setField, blurField, submit };
};
