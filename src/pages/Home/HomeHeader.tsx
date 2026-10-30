/**
 * Hauptscreen-Header: Uhrzeit, Companion-Name, Online/Offline-Punkt.
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

function formatClock(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function HomeHeader() {
  const companionName = useAppStore((s) => s.companionName);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [online, setOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  );

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', onStatus);
    window.addEventListener('offline', onStatus);
    return () => {
      window.removeEventListener('online', onStatus);
      window.removeEventListener('offline', onStatus);
    };
  }, []);

  return (
    <header className="home-header">
      <div className="home-header__left">
        <span className="home-header__time" aria-live="polite">
          {clock}
        </span>
        <span className="home-header__name">{companionName || 'ORIENT'}</span>
      </div>
      <span
        className="home-header__status"
        data-online={online}
        title={online ? 'Online' : 'Offline'}
        aria-label={online ? 'Online' : 'Offline'}
      />
    </header>
  );
}
