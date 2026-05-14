import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, './src/core'),
      '@data': resolve(__dirname, './src/data'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@visual': resolve(__dirname, './src/visual'),
      '@ui': resolve(__dirname, './src/ui'),
      '@app': resolve(__dirname, './src/app'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
});
