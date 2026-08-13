/** VIEW — indeterminate progress indicator. */

interface SpinnerProps {
  label?: string;
  className?: string;
}

export const Spinner = ({ label = 'Loading', className = '' }: SpinnerProps) => (
  <span
    role="status"
    aria-label={label}
    className={
      'inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-cyan/30 ' +
      `border-t-brand-cyan ${className}`
    }
  />
);
