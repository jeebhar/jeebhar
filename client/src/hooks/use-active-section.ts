import { useEffect, useState } from 'react';

/**
 * Reports which section is currently in view, for nav highlighting.
 *
 * Uses IntersectionObserver rather than a scroll listener so the work happens
 * off the main scroll path.
 *
 * @param sectionIds Ids to watch, in document order.
 * @returns the id of the section nearest the top of the viewport.
 */
export const useActiveSection = (sectionIds: readonly string[]): string => {
  const [active, setActive] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      // Bias the band towards the upper half so the heading you are reading wins.
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
};
