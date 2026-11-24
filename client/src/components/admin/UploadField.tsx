import { useId, useRef, useState } from 'react';

import { Spinner, TextField } from '../ui';
import { toErrorMessage } from '../../utils/error';

/**
 * VIEW — a URL field with an "Upload…" button and a small preview.
 *
 * Uploading puts the file on the server (public_html/uploads) and fills the
 * field with its address. Pasting an https:// link still works, so images
 * hosted elsewhere need no upload.
 */

export type Uploader = (file: File) => Promise<string>;

interface UploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  upload: Uploader;
  /** "image" shows a thumbnail and only offers image files. */
  accept: 'image' | 'document';
  placeholder?: string;
  hint?: string;
}

const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  document:
    'application/pdf,.pdf,.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const UploadField = ({
  label,
  value,
  onChange,
  upload,
  accept,
  placeholder,
  hint,
}: UploadFieldProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await upload(file));
    } catch (caught) {
      setError(toErrorMessage(caught, 'Upload failed.'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-end gap-2">
        <TextField
          className="flex-1"
          label={label}
          value={value}
          placeholder={placeholder}
          error={error || undefined}
          onChange={onChange}
        />
        <label
          htmlFor={inputId}
          className="mb-px inline-flex h-[46px] cursor-pointer items-center gap-2 rounded-lg border border-brand-cyan/60 px-3 text-sm font-semibold text-brand-cyan transition hover:bg-brand-cyan/10 focus-within:outline focus-within:outline-2 focus-within:outline-brand-cyan"
        >
          {busy ? <Spinner label="Uploading" /> : null}
          {busy ? 'Uploading…' : 'Upload…'}
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={ACCEPT[accept]}
            className="sr-only"
            disabled={busy}
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
        </label>
      </div>

      {accept === 'image' && value && (
        <img
          src={value}
          alt=""
          className="h-24 w-36 rounded-md border border-white/10 object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          onLoad={(event) => {
            event.currentTarget.style.display = '';
          }}
        />
      )}
      {accept === 'document' && value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-cyan hover:underline"
        >
          Open current file &rarr;
        </a>
      )}
      {hint && <p className="text-xs text-brand-200">{hint}</p>}
    </div>
  );
};
