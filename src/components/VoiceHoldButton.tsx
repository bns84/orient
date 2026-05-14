/**
 * ORIENT - Voice Hold Button
 * 
 * Press & Hold to record voice.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfache Interaktion)
 * - Transparenz (Status sichtbar)
 */

import React from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

function msToClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function VoiceHoldButton() {
  const { status, error, durationMs, start, stop } = useVoiceRecorder();

  const isRecording = status === 'recording' || status === 'saving';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          if (!isRecording) start();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          stop();
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          stop();
        }}
        onPointerLeave={(e) => {
          // optional: stop when leaving while pressed
          if (isRecording) stop();
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
        {isRecording ? `Recording… ${msToClock(durationMs)}` : 'Hold to Record'}
      </button>

      {error && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.9,
            color: 'rgba(255,180,180,0.95)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
