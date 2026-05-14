/**
 * ORIENT - Attach Last Voice Button
 * 
 * Button zum Anhängen der letzten Voice-Note an das fokussierte Panel.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfache Interaktion)
 * - Transparenz (Feedback sichtbar)
 */

import React from 'react';
import { attachLastVoiceToFocus } from '../db/attachments';

export function AttachLastVoiceButton() {
  const [msg, setMsg] = React.useState<string | null>(null);

  const onAttach = async () => {
    const r = await attachLastVoiceToFocus();
    if (!r.ok) {
      if (r.reason === 'no_focus') setMsg('No focused panel. Tap a panel to focus first.');
      if (r.reason === 'no_voice') setMsg('No voice note available yet.');
      return;
    }
    setMsg(`Attached voice #${r.voiceId} to "${r.targetId}".`);
    window.setTimeout(() => setMsg(null), 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={onAttach}
        style={{
          borderRadius: 12,
          padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.08)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Attach last voice to focus
      </button>

      {msg && <div style={{ fontSize: 12, opacity: 0.7 }}>{msg}</div>}
    </div>
  );
}
