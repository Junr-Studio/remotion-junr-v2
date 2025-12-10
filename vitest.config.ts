import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/animations': '/src/animations',
      '@/components': '/src/components',
      '@/utils': '/src/utils',
      '@/types': '/src/types',
    },
  },
});
