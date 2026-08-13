const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const appConfig = {
  apiBaseUrl: trimTrailingSlash(
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000/api'
  ),

  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 15_000),

  brand: {
    name: 'Jeebhar',
    tagline: 'Social media marketing for restaurants and food brands',

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
