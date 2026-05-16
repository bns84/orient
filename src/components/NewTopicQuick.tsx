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
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { ThreadStatus } from '../core/threads/ThreadStatus';

type Props = {
  onCreated?: () => void;
};

export function NewTopicQuick({ onCreated }: Props) {
  const { threadRepo } = useAppServices();
  const [v, setV] = React.useState('');

  const onCreate = async () => {
    if (!v.trim()) return;
    const row = await createTopicFromPrompt(v.trim(), 'manual');
    const now = new Date();
    await threadRepo.save({
      id: row.key,
      title: row.title,
      status: ThreadStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      metrics: {
        recencyScore: 0.5,
        frequencyScore: 0.2,
        confidenceScore: 0.3,
        userRelevanceScore: 0.6,
      },
    });
    setV('');
    onCreated?.();
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
