/**
 * ORIENT - New Topic Quick Component
 * 
 * Platzhalter für Voice-Intent: Erzeugt neue Topics aus Textprompt.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (kein Chat, keine Historie)
 * - Menschliche Sprache ("Thema anlegen", nicht "Create Topic")
 * - Kein Feed (nur lokale Erzeugung)
 */

import React from 'react';
import { createTopicFromPrompt } from '../db/topics';

export function NewTopicQuick() {
  const [v, setV] = React.useState('');

  const onCreate = async () => {
    if (!v.trim()) return;
    await createTopicFromPrompt(v.trim(), 'manual');
    setV('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void onCreate();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Neues Thema… (z.B. Zimtsterne backen)"
        style={{
          flex: 1,
          borderRadius: 12,
          padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(0,0,0,0.25)',
          color: 'white',
          outline: 'none',
          fontSize: 14,
        }}
      />
      <button
        onClick={onCreate}
        style={{
          borderRadius: 12,
          padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.08)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
          transition: 'background 0.2s ease',
        }}
      >
        Neues Thema
      </button>
    </div>
  );
}
