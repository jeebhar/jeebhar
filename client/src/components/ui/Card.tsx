import type { ReactNode } from 'react';

/**
 * VIEW — the shared surface for tiles, metrics and media cards.
 *
 * Renders as whichever element the context needs (`article`, `a`, `div`) while
 * keeping one visual treatment.
 */

interface CardProps {
  as?: 'article' | 'div' | 'a' | 'li';
  href?: string;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

const BASE = 'overflow-hidden rounded-2xl border border-white/10 bg-brand-800/50 backdrop-blur-sm';
const INTERACTIVE =
  'transition hover:border-brand-cyan/50 hover:bg-brand-800/80 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand-cyan';

export const Card = ({
  as: Element = 'article',
  href,
  interactive = false,
  className = '',
  children,
}: CardProps) => {
  const classes = `${BASE} ${interactive ? INTERACTIVE : ''} ${className}`;

  if (Element === 'a') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`block ${classes}`}>
        {children}
      </a>
    );
  }

  return <Element className={classes}>{children}</Element>;
};
