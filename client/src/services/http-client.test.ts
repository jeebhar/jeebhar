import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, httpClient } from './http-client';

/** Verifies the envelope handling and error normalisation, not fetch itself. */

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('httpClient', () => {
  it('unwraps the data property of a successful envelope', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true, data: { brandName: 'Jeebhar' } }));

    await expect(httpClient.get('/content')).resolves.toEqual({ brandName: 'Jeebhar' });
  });

  it('sends JSON headers and a serialised body on PUT', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true, data: {} }));

    await httpClient.put(
      '/content',
      { brandName: 'Jeebhar' },
      { headers: { Authorization: 'Bearer t' } }
    );

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PUT');
    expect(init.body).toBe('{"brandName":"Jeebhar"}');
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer t',
    });
  });

  it('throws an ApiError carrying the status and message on failure', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: false, message: 'Invalid token.' }, 403));

    await expect(httpClient.get('/content')).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      message: 'Invalid token.',
    });
  });

  it('preserves field-level validation details', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          message: 'Validation failed.',
          details: [{ field: 'email', message: 'Enter a valid email address.' }],
        },
        400
      )
    );

    await expect(httpClient.post('/contact', {})).rejects.toMatchObject({
      details: [{ field: 'email', message: 'Enter a valid email address.' }],
    });
  });

  it('reports a network failure as a friendly message rather than leaking the cause', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await httpClient.get('/content').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).message).toMatch(/cannot reach the server/i);
  });

  it('rejects a non-JSON body instead of throwing a parse error', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('<html>502</html>', { status: 502 }));

    await expect(httpClient.get('/content')).rejects.toMatchObject({
      message: 'The server returned an unreadable response.',
    });
  });
});
