import { Button, TextField } from '../ui';
import type { EditableRow } from '../../features/content/hooks/use-content-editor';

export interface FieldDescriptor<T> {
  key: keyof T & string;
  label: string;
  placeholder?: string;
  /** Renders a textarea with this many rows. */
  rows?: number;
}

interface EditableRowListProps<T> {
  legend: string;
  rows: Array<EditableRow<T>>;
  fields: ReadonlyArray<FieldDescriptor<T>>;
  addLabel: string;
  emptyMessage: string;
  onChange: (key: string, patch: Partial<T>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}

export const EditableRowList = <T extends object>({
  legend,
  rows,
  fields,
  addLabel,
  emptyMessage,
  onChange,
  onAdd,
  onRemove,
}: EditableRowListProps<T>) => (
  <fieldset className="rounded-2xl border border-white/10 bg-brand-800/30 p-5">
    <legend className="px-2 text-lg font-semibold text-white">{legend}</legend>

    {rows.length === 0 ? (
      <p className="py-3 text-sm text-brand-200">{emptyMessage}</p>
    ) : (
      <ul className="grid gap-5">
        {rows.map((row, index) => (
          <li key={row.key} className="rounded-xl border border-white/10 bg-brand-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                Item {index + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(row.key)}
                aria-label={`Remove ${legend} item ${index + 1}`}
              >
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <TextField
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  value={String(row.value[field.key] ?? '')}
                  onChange={(value) => onChange(row.key, { [field.key]: value } as Partial<T>)}
                  className={field.rows ? 'md:col-span-2' : ''}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    )}

    <Button variant="outline" size="sm" className="mt-5" onClick={onAdd}>
      + {addLabel}
    </Button>
  </fieldset>
);
