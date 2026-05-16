/**
 * Text-Gedanke erfassen — kein Chat, nur Impulse
 */

import React, { useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { logEvent } from '../db/events';

type Props = {
  threadId?: string | null;
  onCaptured?: () => void;
};

export function TextImpulseInput({ threadId, onCaptured }: Props) {
  const { captureImpulse, contextService } = useAppServices();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus('saving');
    setMessage(null);

    const ctx = await contextService.getCurrent();
    const res = await captureImpulse.execute(
      { text: trimmed, threadId: threadId ?? undefined },
      { contextMode: ctx.mode, timestamp: new Date() },
    );

    if (res.ok) {
      await logEvent('impulse.captured', { source: 'text' });
      setText('');
      setStatus('ok');
      setMessage('Gespeichert.');
      onCaptured?.();
      window.setTimeout(() => {
        setStatus('idle');
        setMessage(null);
      }, 1500);
    } else {
      setStatus('error');
      setMessage(res.message ?? 'Speichern fehlgeschlagen.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Gedanke</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          placeholder="Kurz notieren…"
          disabled={status === 'saving'}
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
          type="button"
          onClick={() => void submit()}
          disabled={status === 'saving' || !text.trim()}
          style={{
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontSize: 14,
            opacity: text.trim() ? 1 : 0.5,
          }}
        >
          {status === 'saving' ? '…' : 'Speichern'}
        </button>
      </div>
      {message ? <div style={{ fontSize: 12, opacity: 0.75 }}>{message}</div> : null}
    </div>
  );
}
