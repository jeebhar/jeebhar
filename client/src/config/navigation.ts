/**
 * The site's section order, declared once.
 *
 * The header, the mobile menu and the scroll targets all read this list, so a
 * new section is one entry here rather than three edits (Single Source of Truth
 * / Open–Closed).
 */

export interface NavSection {
  id: string;
  label: string;
}

export const NAV_SECTIONS: readonly NavSection[] = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Our Services' },
  { id: 'experience', label: 'Our Experience' },
  { id: 'work', label: 'Our Work' },
  { id: 'reels', label: 'Our Reels' },
  { id: 'travel', label: 'Travel Reels' },
  { id: 'contact', label: 'Contact Us' },
] as const;

/**
 * Section ids as a stable, module-level array.
 *
 * Derived once so hooks that depend on it (e.g. `useActiveSection`) get the same
 * reference on every render and their effects do not re-subscribe each time.
 */
export const NAV_SECTION_IDS: readonly string[] = NAV_SECTIONS.map((section) => section.id);
