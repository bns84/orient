/**
 * ORIENT - Main Entry Point
 * 
 * PWA Entry Point - respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 * - Local-first
 */

import { App } from './App';

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// App Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
