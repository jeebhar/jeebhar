import { Logo } from '../ui';
import type { ContactDetails } from '../../models/site-content.model';
import { useI18n } from '../../i18n';

/**
 * VIEW — site footer: logo, contact details, social links.
 *
 * Social entries are filtered to those actually configured, so an unset URL
 * disappears instead of rendering a dead link.
 */

interface FooterProps {
  brandName: string;
  contact: ContactDetails;
}

const socialLinks = (contact: ContactDetails) =>
  [
    { label: 'Instagram', href: contact.instagramUrl },
    { label: 'Facebook', href: contact.facebookUrl },
    { label: 'YouTube', href: contact.youtubeUrl },
    { label: 'TikTok', href: contact.tiktokUrl },
  ].filter((link) => Boolean(link.href));

export const Footer = ({ brandName, contact }: FooterProps) => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-white/10 bg-brand-950/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr,1fr,1fr]">
        <div>
          <Logo variant="full" height={40} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">
            {t('footer.tagline')}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">
            {t('footer.contact')}
          </h2>
          <address className="mt-4 grid gap-2 text-sm not-italic text-brand-100">
            <span>{contact.address}</span>
            <a href={`mailto:${contact.email}`} className="hover:text-white">
              {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">
              {contact.phone}
            </a>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">
            {t('footer.follow')}
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {socialLinks(contact).map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-100 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-6xl text-xs text-brand-200">
          {t('footer.rights', { year: new Date().getFullYear(), brand: brandName })}
        </p>
      </div>
    </footer>
  );
};
