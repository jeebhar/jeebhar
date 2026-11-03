import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useContactForm } from './use-contact-form';
import { ApiError } from '../../../services/http-client';

/** The hook's only collaborator is the API module, so that is what we stub. */
const submitMock = vi.fn();

vi.mock('../api/contact.api', () => ({
  submitContactEnquiry: (...args: unknown[]) => submitMock(...args),
}));

const fill = (result: { current: ReturnType<typeof useContactForm> }) => {
  act(() => {
    result.current.setField('name', 'Asha Rao');
    result.current.setField('email', 'asha@example.com');
    result.current.setField('phone', '+91 90000 00000');
    result.current.setField('subject', 'Campaign enquiry');
    result.current.setField('body', 'We would like help launching our new outlet.');
  });
};

beforeEach(() => submitMock.mockReset());
afterEach(() => vi.clearAllMocks());

describe('useContactForm', () => {
  it('does not call the API when the form is invalid', async () => {
    const { result } = renderHook(() => useContactForm());

    await act(async () => {
      await result.current.submit();
    });

    expect(submitMock).not.toHaveBeenCalled();
    expect(result.current.state).toBe('error');
    expect(Object.keys(result.current.errors)).toHaveLength(5);
  });

  it('submits a valid payload and clears the form on success', async () => {
    submitMock.mockResolvedValue({ id: 'sub-1', notified: true });
    const { result } = renderHook(() => useContactForm());

    fill(result);
    await act(async () => {
      await result.current.submit();
    });

    expect(submitMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Asha Rao', email: 'asha@example.com' })
    );
    await waitFor(() => expect(result.current.state).toBe('success'));
    expect(result.current.values.name).toBe('');
    expect(result.current.feedback).toMatch(/received/i);
  });

  it('surfaces the server message when submission fails', async () => {
    submitMock.mockRejectedValue(new ApiError('Service unavailable', 503));
    const { result } = renderHook(() => useContactForm());

    fill(result);
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.feedback).toBe('Service unavailable');
    // The user's input must survive a failure so they can retry.
    expect(result.current.values.name).toBe('Asha Rao');
  });

  it('shows a translated generic message for an unexpected failure', async () => {
    submitMock.mockRejectedValue(new Error('socket hang up'));
    const { result } = renderHook(() => useContactForm());

    fill(result);
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.feedback).toBe('Unable to send your enquiry. Please try again.');
  });

  it('validates a field on blur and clears the error once it is corrected', () => {
    const { result } = renderHook(() => useContactForm());

    act(() => result.current.setField('email', 'nope'));
    act(() => result.current.blurField('email', 'nope'));
    expect(result.current.errors.email).toMatch(/valid email/i);

    act(() => result.current.setField('email', 'asha@example.com'));
    expect(result.current.errors.email).toBeUndefined();
  });
});
