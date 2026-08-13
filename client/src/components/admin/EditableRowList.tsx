import { Button, TextField } from '../ui';
import type { EditableList } from '../../features/content/hooks/use-content-editor';

/**
 * VIEW — a generic editor table for one collection.
 *
 * Fields are described as data and the collection arrives as a single
 * `EditableList` handle, so Work, Reels and Travel Reels are three usages of
 * this component. Adding a field is one entry in a `fields` array.
 */

export interface FieldDescriptor<T> {
  key: keyof T & string;
  label: string;
  placeholder?: string;
  /** Renders a textarea with this many rows. */
  rows?: number;
  /** Shown under the input as guidance. */
  hint?: string;
}

interface EditableRowListProps<T> {
  legend: string;
  description?: string;
  list: EditableList<T>;
  fields: ReadonlyArray<FieldDescriptor<T>>;
  addLabel: string;
  emptyMessage: string;
}

export const EditableRowList = <T extends object>({
  legend,
  description,
  list,
  fields,
  addLabel,
  emptyMessage,
}: EditableRowListProps<T>) => (
  <fieldset className="rounded-2xl border border-white/10 bg-brand-800/30 p-5">
    <legend className="px-2 text-lg font-semibold text-white">{legend}</legend>

    {description && <p className="mb-4 text-sm text-brand-200">{description}</p>}

    {list.rows.length === 0 ? (
      <p className="py-3 text-sm text-brand-200">{emptyMessage}</p>
    ) : (
      <ul className="grid gap-5">
        {list.rows.map((row, index) => (
          <li key={row.key} className="rounded-xl border border-white/10 bg-brand-900/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                Item {index + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => list.remove(row.key)}
                aria-label={`Remove ${legend} item ${index + 1}`}
              >
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.rows ? 'md:col-span-2' : ''}>
                  <TextField
                    label={field.label}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    value={String(row.value[field.key] ?? '')}
                    onChange={(value) => list.update(row.key, { [field.key]: value } as Partial<T>)}
                  />
                  {field.hint && <p className="mt-1 text-xs text-brand-200">{field.hint}</p>}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    )}

    <Button variant="outline" size="sm" className="mt-5" onClick={list.add}>
      + {addLabel}
    </Button>
  </fieldset>
);
