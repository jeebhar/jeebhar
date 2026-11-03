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
  // The five entries from the brief. "Our Experience" (media-kit numbers) and
  // "Travel Reels" are still on the page — they sit under Services and Reels —
  // but are not separate menu items, to keep the menu short on phones.
  // The Media Kit button and the EN | DE toggle follow these in the header.
  { id: 'home', labelKey: 'nav.home' },
  { id: 'services', labelKey: 'nav.services' },
  { id: 'work', labelKey: 'nav.work' },
  { id: 'reels', labelKey: 'nav.reels' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const;

/**
 * Section ids as a stable, module-level array.
 *
 * Derived once so hooks that depend on it (e.g. `useActiveSection`) get the same
 * reference on every render and their effects do not re-subscribe each time.
 */
export const NAV_SECTION_IDS: readonly string[] = NAV_SECTIONS.map((section) => section.id);
