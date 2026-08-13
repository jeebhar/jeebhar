import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF7FA',
          100: '#CDE9EF',
          200: '#A7D8E2',
          cyan: '#6BCDDA',
          mint: '#76CEBB',
          500: '#1B7A9B',
          600: '#0A5C7D',
          700: '#00415E',
          800: '#062F42',
          900: '#04202D',
          950: '#03131B',
        },
        accent: {
          DEFAULT: '#F7732F',
          600: '#DF5C19',
          700: '#B9480F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        '6xl': '72rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
