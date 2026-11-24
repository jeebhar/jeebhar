import type { ReactNode } from 'react';

/**
 * VIEW — the shared section shell: id anchor, heading, optional actions.
 *
 * Every page section uses it, which is what keeps vertical rhythm and heading
 * hierarchy identical without repeating layout classes.
 */

interface SectionProps {
  id?: string;
  title?: string;
  description?: string;
  /** Controls placed on the heading row, e.g. carousel arrows. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Section = ({
  id,
  title,
  description,
  actions,
  children,
  className = '',
}: SectionProps) => (
  <section
    id={id}
    aria-labelledby={id && title ? `${id}-heading` : undefined}
    className={`scroll-mt-24 py-14 md:py-20 ${className}`}
  >
    {title && (
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-2xl font-bold tracking-tight text-white md:text-4xl"
          >
            {title}
          </h2>
          {description && <p className="mt-2 max-w-2xl text-brand-100">{description}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </section>
);
