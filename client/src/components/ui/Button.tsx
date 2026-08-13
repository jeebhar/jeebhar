import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * VIEW — the single button primitive.
 *
 * Variants are data, not duplicated class strings, so a restyle happens here
 * once instead of across every screen (Open–Closed).
 */

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand-cyan disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-cyan text-brand-900 hover:bg-brand-mint',
  accent: 'bg-accent text-white hover:bg-accent-600',
  outline: 'border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10',
  ghost: 'text-brand-100 hover:bg-white/10',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
