/**
 * ORIENT - Topic Share Button Component
 * 
 * Button zum Teilen eines Topics (Clipboard).
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (dezentes Feedback)
 * - Menschliche Sprache ("Kopiert.", nicht "Share successful")
 * - Kein neuer Screen (Toast-Feedback)
 */

import React from 'react';
import { shareToClipboard } from '../share/share';
import { ShareTopic } from '../share/compose';

type Props = {
  topic: ShareTopic;
};

export function TopicShareButton({ topic }: Props) {
  const [msg, setMsg] = React.useState<string | null>(null);

  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareToClipboard(topic);
    setMsg('Kopiert.');
    window.setTimeout(() => setMsg(null), 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button
        onClick={onShare}
        title="Diesen Gedanken teilen"
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.06)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease',
        }}
      >
        ↗
      </button>
      {msg && <div style={{ fontSize: 12, opacity: 0.7 }}>{msg}</div>}
    </div>
  );
}
