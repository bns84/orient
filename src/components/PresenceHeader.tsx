/**
 * ORIENT - Presence Header Component
 */

import React from 'react';
import { getPresentationHints } from '../behavior/engine';
import { useAppStore } from '../store/useAppStore';
import { OrientBubble } from './Bubble/OrientBubble';

const moodLabel: Record<string, string> = {
  aktiv: 'aktiv',
  fokussiert: 'fokussiert',
  müde: 'müde',
  neugierig: 'neugierig',
  ruhe: 'ruhig',
};

export function PresenceHeader() {
  const hints = getPresentationHints();
  const companionName = useAppStore((s) => s.companionName);
  const presence = useAppStore((s) => s.presence);
  const currentMood = useAppStore((s) => s.currentMood);

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
        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>
          {companionName || 'ORIENT'}
        </div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>{line}</div>
        <div style={{ fontSize: 11, opacity: 0.45 }}>
          {moodLabel[currentMood] ?? currentMood}
        </div>
      </div>

      <OrientBubble state={presence} width={120} height={120} />
    </div>
  );
}
