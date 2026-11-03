import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UploadField } from './UploadField';

const file = new File(['png'], 'dosa.png', { type: 'image/png' });

describe('UploadField', () => {
  it('uploads the chosen file and fills the field with its URL', async () => {
    const upload = vi.fn().mockResolvedValue('/uploads/dosa-1a2b.png');
    const onChange = vi.fn();
    render(
      <UploadField accept="image" label="Image" value="" onChange={onChange} upload={upload} />
    );

    await userEvent.upload(screen.getByLabelText(/upload/i), file);

    expect(upload).toHaveBeenCalledWith(file);
    expect(onChange).toHaveBeenCalledWith('/uploads/dosa-1a2b.png');
  });

  it('shows why an upload failed and leaves the value alone', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('Enter your admin token at the top first.'));
    const onChange = vi.fn();
    render(
      <UploadField accept="image" label="Image" value="" onChange={onChange} upload={upload} />
    );

    await userEvent.upload(screen.getByLabelText(/upload/i), file);

    expect(await screen.findByText(/admin token/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
