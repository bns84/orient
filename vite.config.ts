import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ORIENT',
        short_name: 'ORIENT',
        description:
          'Ein persönlicher Denk-, Orientierungs- und Entscheidungs-Companion',
        theme_color: '#010208',
        background_color: '#010208',
        display: 'standalone',
        start_url: '/',
        lang: 'de',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Nur Dateitypen, die der Build wirklich ausliefert (kein ico/png in public)
        globPatterns: ['**/*.{js,css,html,svg,wasm,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        // Dev: kein Precache aus dev-dist (nur sw.js/workbox) → sonst Workbox-Warnung
        enabled: false,
      },
    }),
  ],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['sql.js'],
  },
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
