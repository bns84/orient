/**
 * Hauptscreen-Header: Uhrzeit + Mood-Dot (kein Sync in Phase 1).
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { AppMood } from '../../store/types';

const moodColor: Record<AppMood, string> = {
  aktiv: 'var(--color-tech)',
  fokussiert: 'var(--color-language)',
  müde: 'var(--text-secondary)',
  neugierig: 'var(--color-personal)',
  ruhe: 'rgba(120, 150, 255, 0.85)',
};

function formatClock(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function HomeHeader() {
  const companionName = useAppStore((s) => s.companionName);
  const currentMood = useAppStore((s) => s.currentMood);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
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
        className="home-header__mood"
        style={{ background: moodColor[currentMood] ?? moodColor.ruhe }}
        title={currentMood}
        aria-label={`Stimmung: ${currentMood}`}
      />
    </header>
  );
}
