/**
 * ORIENT - React Entry Point (PWA)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AppServicesProvider } from './ui/wiring/AppServicesContext';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AppServicesProvider>
      <App />
    </AppServicesProvider>
  </React.StrictMode>,
);
