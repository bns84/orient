/**
 * ORIENT - Presence Header Component
 * 
 * Platzhalter für die spätere Orb-Visualisierung.
 * Zeigt Präsenz und Hinweis zum Halten & Sprechen.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (kein aufdringliches UI)
 * - Menschliche Sprache (kein "KI", kein "Bot")
 * - Companion-Gefühl (nicht Dev-Tool)
 */

import React from 'react';
import { getPresentationHints } from '../behavior/engine';

export function PresenceHeader() {
  const hints = getPresentationHints();

  const line =
    hints?.tone === 'crisp'
      ? "Sag's kurz. Ich bin da."
      : hints?.tone === 'warm'
        ? 'Ganz ruhig. Sag, was du brauchst.'
        : 'Halten & sprechen.';

  return (
    <div
      style={{
        borderRadius: 22,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>ORIENT</div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>{line}</div>
      </div>

      {/* Placeholder for Orb */}
      <div
        aria-hidden
        style={{
          width: 48,
          height: 48,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25) inset',
        }}
      />
    </div>
  );
}
