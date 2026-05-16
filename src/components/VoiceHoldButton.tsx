/**
 * ORIENT - Voice Hold Button
 *
 * Press & Hold → Audio in Dexie → Impulse im Gedächtnis (nach Stub-Transkript)
 */

import React from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { logEvent } from '../db/events';
import { useAppStore } from '../store/useAppStore';

function msToClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

type Props = {
  threadId?: string | null;
  onImpulseCaptured?: () => void;
};

export function VoiceHoldButton({ threadId, onImpulseCaptured }: Props) {
  const { captureImpulse, contextService } = useAppServices();
  const setPresence = useAppStore((s) => s.setPresence);
  const pulsePresence = useAppStore((s) => s.pulsePresence);

  const { status, error, durationMs, start, stop } = useVoiceRecorder({
    onTranscriptReady: async (voiceId, transcript) => {
      const ctx = await contextService.getCurrent();
      const res = await captureImpulse.execute(
        {
          transcript,
          payloadRef: `voice:${voiceId}`,
          threadId: threadId ?? undefined,
        },
        { contextMode: ctx.mode, timestamp: new Date() },
      );
      if (res.ok) {
        await logEvent('impulse.captured', { source: 'voice', voiceId });
        onImpulseCaptured?.();
        pulsePresence('ready', 1800);
      }
    },
  });

  const isRecording = status === 'recording' || status === 'saving';

  React.useEffect(() => {
    if (status === 'recording') {
      setPresence('listen', { hold: true });
    } else if (status === 'saving') {
      setPresence('think', { hold: true });
    } else if (status === 'idle') {
      setPresence('rest', { hold: true });
    }
  }, [status, setPresence]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          if (!isRecording) void start();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          void stop();
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          void stop();
        }}
        onPointerLeave={(e) => {
          if (isRecording) void stop();
        }}
        style={{
          borderRadius: 16,
          padding: '12px 14px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: isRecording
            ? 'rgba(255,80,80,0.22)'
            : 'rgba(255,255,255,0.08)',
          color: 'white',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {isRecording ? `Aufnahme… ${msToClock(durationMs)}` : 'Gedrückt halten — sprechen'}
      </button>

      {error && (
        <div style={{ fontSize: 12, opacity: 0.9, color: 'rgba(255,180,180,0.95)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
