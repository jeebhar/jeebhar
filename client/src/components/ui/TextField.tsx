import { useId } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  /** Renders a textarea with this many rows instead of an input. */
  rows?: number;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}

const FIELD_CLASSES =
  'w-full rounded-lg border bg-brand-900/60 px-3 py-2.5 text-white placeholder:text-brand-200/50 ' +
  'outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30';

export const TextField = ({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  rows,
  error,
  placeholder,
  autoComplete,
  required,
  className = '',
}: TextFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  const shared = {
    id,
    value,
    onBlur,
    placeholder,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: `${FIELD_CLASSES} ${error ? 'border-red-400/80' : 'border-white/15'}`,
  };

  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-brand-100">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>

      {rows ? (
        <textarea
          {...shared}
          rows={rows}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};
