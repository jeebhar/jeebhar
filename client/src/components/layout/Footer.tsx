import { Logo, SocialLinks } from '../ui';
import type { ContactDetails } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/**
 * VIEW — site footer, centred: logo and tagline, contact details, social
 * icons, copyright. Social icons for unset profiles are left out.
 */

interface FooterProps {
  brandName: string;
  contact: ContactDetails;
}

export const Footer = ({ brandName, contact }: FooterProps) => {
  const { t } = useI18n();
  const tel = contact.phone.replace(/\s/g, '');

  return (
    <footer className="border-t border-white/10 bg-brand-950/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-14 text-center">
        <div className="flex flex-col items-center">
          <Logo variant="full" height={40} />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-200">
            {t('footer.tagline')}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">
            {t('footer.contact')}
          </h2>
          <address className="mt-3 flex flex-col items-center gap-x-6 gap-y-2 text-sm not-italic text-brand-100 sm:flex-row sm:flex-wrap sm:justify-center">
            <span>{contact.address}</span>
            <a href={`mailto:${contact.email}`} className="hover:text-white">
              {contact.email}
            </a>
            <a href={`tel:${tel}`} className="hover:text-white">
              {contact.phone}
            </a>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">
            {t('footer.follow')}
          </h2>
          <SocialLinks contact={contact} className="mt-3 justify-center" />
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-6xl text-center text-xs text-brand-200">
          {t('footer.rights', { year: new Date().getFullYear(), brand: brandName })}
        </p>
      </div>
    </footer>
  );
};
