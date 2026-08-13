import { Logo } from '../ui';
import type { ContactDetails } from '../../models/site-content.model';

interface FooterProps {
  brandName: string;
  tagline: string;
  contact: ContactDetails;
}

const socialLinks = (contact: ContactDetails) =>
  [
    { label: 'Instagram', href: contact.instagramUrl },
    { label: 'Facebook', href: contact.facebookUrl },
    { label: 'YouTube', href: contact.youtubeUrl },
    { label: 'TikTok', href: contact.tiktokUrl },
  ].filter((link) => Boolean(link.href));

export const Footer = ({ brandName, tagline, contact }: FooterProps) => (
  <footer className="border-t border-white/10 bg-brand-950/60">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr,1fr,1fr]">
      <div>
        <Logo variant="full" height={40} />
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">{tagline}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">Contact</h2>
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">Follow</h2>
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
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </p>
    </div>
  </footer>
);
