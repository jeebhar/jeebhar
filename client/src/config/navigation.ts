/**
 * The site's section order, declared once.
 *
 * The header, the mobile menu and the scroll targets all read this list, so a
 * new section is one entry here rather than three edits (Single Source of Truth
 * / Open–Closed). Labels are message keys, translated in the header.
 */

import type { MessageKey } from '../i18n/messages';

export interface NavSection {
  id: string;
  labelKey: MessageKey;
}

export const NAV_SECTIONS: readonly NavSection[] = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'services', labelKey: 'nav.services' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'work', labelKey: 'nav.work' },
  { id: 'reels', labelKey: 'nav.reels' },
  { id: 'travel', labelKey: 'nav.travel' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const;

/**
 * Section ids as a stable, module-level array.
 *
 * Derived once so hooks that depend on it (e.g. `useActiveSection`) get the same
 * reference on every render and their effects do not re-subscribe each time.
 */
export const NAV_SECTION_IDS: readonly string[] = NAV_SECTIONS.map((section) => section.id);
