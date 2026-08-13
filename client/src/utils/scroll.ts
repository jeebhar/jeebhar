/**
 * Smooth-scrolls to a section, respecting a visitor's reduced-motion setting.
 *
 * Kept out of components so no view has to reach into the DOM directly.
 */
export const scrollToSection = (sectionId: string): void => {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
};
