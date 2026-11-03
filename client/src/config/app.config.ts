/**
 * Build-time configuration, read from Vite env vars in exactly one place.
 *
 * Nothing else in the client touches `import.meta.env`, so switching
 * environments never means hunting through components.
 */

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const appConfig = {
  /**
   * Base URL of the API. `/api` works everywhere: on Bluehost the API sits on the
   * same domain, and in development Vite proxies `/api` to the PHP dev server.
   */
  apiBaseUrl: trimTrailingSlash((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'),

  /** How long a request may run before it is aborted (ms). */
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 15_000),

  brand: {
    name: 'Jeebhar',
    tagline: 'Social media marketing for restaurants and food brands',

    /**
     * Fallback for the media kit link.
     *
     * Used when the content document has no `mediaKitUrl` — an `<a>` with an
     * undefined href renders as a link that does nothing at all when clicked,
     * which is far worse than a link to a missing file.
     */
    mediaKitUrl: '/brand/media-kit.pdf',

    /**
     * Two artwork tones. The site is dark, so `light` (reversed) is the default;
     * `dark` exists for light surfaces, PDFs and print.
     */
    logo: {
      light: {
        full: '/brand/jeebhar-logo-light.png',
        fullRetina: '/brand/jeebhar-logo-light@2x.png',
        mark: '/brand/jeebhar-mark-light.png',
      },
      dark: {
        full: '/brand/jeebhar-logo.png',
        fullRetina: '/brand/jeebhar-logo@2x.png',
        mark: '/brand/jeebhar-mark.png',
      },
    },
  },
} as const;
