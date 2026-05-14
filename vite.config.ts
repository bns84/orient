import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
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
  server: {
    port: 3000,
  },
});
