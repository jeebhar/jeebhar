import { useEffect, useState } from 'react';

import { Button, Logo } from '../ui';
import { NAV_SECTIONS, NAV_SECTION_IDS } from '../../config/navigation';
import { useActiveSection } from '../../hooks/use-active-section';
import { scrollToSection } from '../../utils/scroll';

/**
 * VIEW — sticky site header: logo, section nav, media-kit link.
 *
 * The logo sits top-left as the home affordance; the active section is
 * highlighted from scroll position and exposed via `aria-current`.
 */

interface HeaderProps {
  mediaKitUrl: string;
  brandName: string;
}

export const Header = ({ mediaKitUrl, brandName }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useActiveSection(NAV_SECTION_IDS);

  // Close the mobile menu when the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const close = () => setMenuOpen(false);
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            go('home');
          }}
          className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
          aria-label={`${brandName} — back to top`}
        >
          <Logo variant="full" height={36} />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(section.id);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                activeSection === section.id
                  ? 'bg-brand-cyan/15 text-brand-cyan'
                  : 'text-brand-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              {section.label}
            </a>
          ))}
          <a
            href={mediaKitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
          >
            Media Kit
          </a>
        </nav>

        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </Button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-white/10 bg-brand-950 px-4 py-3 lg:hidden"
        >
          <ul className="grid gap-1">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={activeSection === section.id ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(section.id);
                  }}
                  className="block rounded-md px-3 py-2.5 text-brand-100 hover:bg-white/10 hover:text-white"
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={mediaKitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-3 py-2.5 font-semibold text-accent hover:bg-white/10"
              >
                Media Kit
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
