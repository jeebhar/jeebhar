import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    // Keep vendor code in its own chunk so app edits do not bust its cache.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
    },
  },
});
