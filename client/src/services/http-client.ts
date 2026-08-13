import { appConfig } from '../config/app.config';

/**
 * The one place the client speaks HTTP.
 *
 * Owns the base URL, JSON encoding, timeouts, the API's `{ ok, data, message }`
 * envelope and error normalisation. Feature APIs call `httpClient.get/put/post`
 * and never see `fetch`, so retries, auth headers or tracing can be added here
 * alone.
 */

/** Error carrying what the API said, so views can show a real message. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const timeoutSignal = (ms: number): AbortSignal => AbortSignal.timeout(ms);

const mergeSignals = (signals: Array<AbortSignal | undefined>): AbortSignal => {
  const present = signals.filter((signal): signal is AbortSignal => Boolean(signal));
  // AbortSignal.any is widely supported; fall back to the first signal.
  return typeof AbortSignal.any === 'function' ? AbortSignal.any(present) : present[0];
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {}, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: mergeSignals([signal, timeoutSignal(appConfig.requestTimeoutMs)]),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ApiError('The server took too long to respond. Please try again.', 408);
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request cancelled.', 499);
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  // 204 and other empty bodies must not blow up JSON parsing.
  const raw = await response.text();
  let envelope: ApiEnvelope<T> = {} as ApiEnvelope<T>;
  if (raw) {
    try {
      envelope = JSON.parse(raw) as ApiEnvelope<T>;
    } catch {
      throw new ApiError('The server returned an unreadable response.', response.status);
    }
  }

  if (!response.ok || envelope.ok === false) {
    throw new ApiError(
      envelope.message ?? `Request failed with status ${response.status}.`,
      response.status,
      envelope.details
    );
  }

  return envelope.data as T;
};

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
};
