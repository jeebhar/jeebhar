import { useId } from 'react';

/** VIEW — a labelled dropdown, styled like TextField. */

interface SelectFieldProps {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
}

export const SelectField = ({
  label,
  value,
  options,
  onChange,
  className = '',
}: SelectFieldProps) => {
  const id = useId();
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-brand-100">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/15 bg-brand-900/60 px-3 py-2.5 text-white outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
