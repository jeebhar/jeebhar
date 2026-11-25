import { useEffect, useState } from 'react';

import { Button, Logo } from '../ui';
import { LanguageToggle } from './LanguageToggle';
import { RegionToggle } from './RegionToggle';
import { NAV_SECTIONS, NAV_SECTION_IDS } from '../../config/navigation';
import { useActiveSection } from '../../hooks/use-active-section';
import { scrollToSection } from '../../utils/scroll';
import { useI18n } from '../../i18n';

/**
 * VIEW — sticky site header: logo, section nav, media-kit link, EN/DE toggle.
 *
 * The logo sits top-left as the home affordance; the active section is
 * highlighted from scroll position and exposed via `aria-current`.
 */

interface HeaderProps {
  mediaKitUrl: string;
  brandName: string;
}

export const Header = ({ mediaKitUrl, brandName }: HeaderProps) => {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useActiveSection(NAV_SECTION_IDS);

  // Close the mobile menu when the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)');
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
          aria-label={t('nav.backToTop', { brand: brandName })}
        >
          <Logo variant="full" height={36} />
        </a>

        <nav aria-label={t('nav.main')} className="hidden items-center gap-1 xl:flex">
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
              {t(section.labelKey)}
            </a>
          ))}
          <a
            href={mediaKitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
          >
            {t('nav.mediaKit')}
          </a>
          <LanguageToggle className="ml-2" />
          <RegionToggle className="ml-2" />
        </nav>

        {/* Below 1280px: language switch next to the menu; region switch inside it. */}
        <div className="flex items-center gap-2 xl:hidden">
          <LanguageToggle />
          <Button
            variant="outline"
            size="sm"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? t('nav.close') : t('nav.menu')}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label={t('nav.main')}
          className="border-t border-white/10 bg-brand-950 px-4 py-3 xl:hidden"
        >
          <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3 text-sm text-brand-200">
            <span>{t('region.label')}</span>
            <RegionToggle />
          </div>
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
                  {t(section.labelKey)}
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
                {t('nav.mediaKit')}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
