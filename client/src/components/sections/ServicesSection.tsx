import { useState } from 'react';

import { Section } from '../ui';
import type { ServiceItem } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/**
 * VIEW — services as an accessible accordion.
 *
 * Built from real `button` elements with `aria-expanded`/`aria-controls`, so it
 * is keyboard operable and announced correctly — the previous version nested
 * interactive content inside clickable cards.
 */

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection = ({ services }: ServicesSectionProps) => {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Section id="services" title={t('services.title')} description={t('services.description')}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {services.map((service, index) => {
          const isOpen = openIndex === index;
          const panelId = `service-panel-${index}`;
          const buttonId = `service-button-${index}`;

          return (
            <li
              key={service._id ?? service.title}
              className={`rounded-2xl border transition ${
                isOpen
                  ? 'border-brand-cyan/60 bg-brand-800/70'
                  : 'border-white/10 bg-brand-800/40 hover:border-brand-cyan/40'
              }`}
            >
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
              >
                <span>
                  <span className="block text-lg font-semibold text-white">{service.title}</span>
                  <span className="mt-1 block text-sm text-brand-200">
                    {service.shortDescription}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-1 shrink-0 text-xl leading-none text-brand-cyan transition-transform ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-brand-100"
              >
                {service.longDescription}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};
