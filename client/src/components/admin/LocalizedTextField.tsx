import { TextField } from '../ui';
import type { LocalizedText } from '../../models/site-content.model';

/**
 * VIEW — one translatable field as an English / Deutsch pair.
 *
 * English is the required original. German may stay empty: the German page then
 * shows the English text, so translation can happen gradually.
 */

interface LocalizedTextFieldProps {
  label: string;
  value: LocalizedText | undefined;
  onChange: (value: LocalizedText) => void;
  rows?: number;
  placeholder?: string;
}

export const LocalizedTextField = ({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: LocalizedTextFieldProps) => {
  const current: LocalizedText = { en: value?.en ?? '', de: value?.de ?? '' };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField
        label={`${label} · English`}
        rows={rows}
        placeholder={placeholder}
        value={current.en}
        onChange={(en) => onChange({ ...current, en })}
      />
      <TextField
        label={`${label} · Deutsch`}
        rows={rows}
        placeholder={current.en ? 'Leer = englischer Text wird gezeigt' : undefined}
        value={current.de}
        onChange={(de) => onChange({ ...current, de })}
      />
    </div>
  );
};
