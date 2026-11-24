import type { FormEvent } from 'react';

import { Alert, Button, Section, SocialLinks, Spinner, TextField } from '../ui';
import { useContactForm } from '../../features/contact/hooks/use-contact-form';
import type { ContactDetails } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
  const { values, errors, state, feedback, setField, blurField, submit } = useContactForm();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <Section id="contact" title={t('contact.title')} description={t('contact.description')}>
      <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t('contact.name')}
              value={values.name}
              error={errors.name}
              autoComplete="name"
              required
              onChange={(value) => setField('name', value)}
              onBlur={() => blurField('name', values.name)}
            />
            <TextField
              label={t('contact.email')}
              type="email"
              value={values.email}
              error={errors.email}
              autoComplete="email"
              required
              onChange={(value) => setField('email', value)}
              onBlur={() => blurField('email', values.email)}
            />
            <TextField
              label={t('contact.phone')}
              type="tel"
              value={values.phone}
              error={errors.phone}
              autoComplete="tel"
              required
              onChange={(value) => setField('phone', value)}
              onBlur={() => blurField('phone', values.phone)}
            />
            <TextField
              label={t('contact.subject')}
              value={values.subject}
              error={errors.subject}
              required
              onChange={(value) => setField('subject', value)}
              onBlur={() => blurField('subject', values.subject)}
            />
          </div>

          <TextField
            label={t('contact.body')}
            rows={6}
            value={values.body}
            error={errors.body}
            required
            placeholder={t('contact.bodyPlaceholder')}
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
              {state === 'submitting' ? <Spinner label={t('contact.sending')} /> : null}
              {state === 'submitting' ? t('contact.sending') : t('contact.send')}
            </Button>
          </div>

          {feedback && <Alert tone={state === 'success' ? 'success' : 'error'}>{feedback}</Alert>}
        </form>

        <aside className="h-fit rounded-2xl border border-white/10 bg-brand-800/40 p-6">
          <h3 className="text-lg font-semibold text-white">{t('contact.direct')}</h3>
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
          <SocialLinks contact={contact} size="sm" className="mt-5" />
        </aside>
      </div>
    </Section>
  );
};
