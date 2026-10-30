/**
 * ORIENT - React Entry Point (PWA)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AppServicesProvider } from './ui/wiring/AppServicesContext';

/** Service Worker nur in Production — in Dev sonst oft alter Cache in Chrome. */
if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AppServicesProvider>
      <App />
    </AppServicesProvider>
  </React.StrictMode>,
);
