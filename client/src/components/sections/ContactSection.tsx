import type { FormEvent } from 'react';

import { Alert, Button, Section, Spinner, TextField } from '../ui';
import { useContactForm } from '../../features/contact/hooks/use-contact-form';
import type { ContactDetails } from '../../models/site-content.model';

/**
 * VIEW — the enquiry form.
 *
 * All state lives in `useContactForm`; this component only binds inputs and
 * renders feedback, which is what keeps it readable at a glance.
 */

interface ContactSectionProps {
  contact: ContactDetails;
}

export const ContactSection = ({ contact }: ContactSectionProps) => {
  const { values, errors, state, feedback, setField, blurField, submit } = useContactForm();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <Section
      id="contact"
      title="Contact Us"
      description="Tell us about your restaurant and what you want to achieve."
    >
      <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Name"
              value={values.name}
              error={errors.name}
              autoComplete="name"
              required
              onChange={(value) => setField('name', value)}
              onBlur={() => blurField('name', values.name)}
            />
            <TextField
              label="Email"
              type="email"
              value={values.email}
              error={errors.email}
              autoComplete="email"
              required
              onChange={(value) => setField('email', value)}
              onBlur={() => blurField('email', values.email)}
            />
            <TextField
              label="Phone number"
              type="tel"
              value={values.phone}
              error={errors.phone}
              autoComplete="tel"
              required
              onChange={(value) => setField('phone', value)}
              onBlur={() => blurField('phone', values.phone)}
            />
            <TextField
              label="Subject"
              value={values.subject}
              error={errors.subject}
              required
              onChange={(value) => setField('subject', value)}
              onBlur={() => blurField('subject', values.subject)}
            />
          </div>

          <TextField
            label="Message"
            rows={6}
            value={values.body}
            error={errors.body}
            required
            placeholder="What are you working on, and what does success look like?"
            onChange={(value) => setField('body', value)}
            onBlur={() => blurField('body', values.body)}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={state === 'submitting'}
              aria-busy={state === 'submitting'}
            >
              {state === 'submitting' ? <Spinner label="Sending" /> : null}
              {state === 'submitting' ? 'Sending…' : 'Send enquiry'}
            </Button>
          </div>

          {feedback && <Alert tone={state === 'success' ? 'success' : 'error'}>{feedback}</Alert>}
        </form>

        <aside className="h-fit rounded-2xl border border-white/10 bg-brand-800/40 p-6">
          <h3 className="text-lg font-semibold text-white">Prefer to reach us directly?</h3>
          <address className="mt-4 grid gap-3 text-sm not-italic text-brand-100">
            <span>{contact.address}</span>
            <a href={`mailto:${contact.email}`} className="text-brand-cyan hover:text-brand-mint">
              {contact.email}
            </a>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="text-brand-cyan hover:text-brand-mint"
            >
              {contact.phone}
            </a>
          </address>
        </aside>
      </div>
    </Section>
  );
};
