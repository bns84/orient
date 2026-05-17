/**
 * ORIENT - Voice Hold Button
 *
 * Runder Daumen-Button: Press & Hold → Transkript → Impulse
 */

import React, { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { logEvent } from '../db/events';
import { useAppStore } from '../store/useAppStore';
import { tryExecuteVoiceCommand } from '../services/commands';
import type { AutoTopicResult } from '../services/auto-topic-engine';

const BTN_SIZE = 76;

function msToClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

type Props = {
  threadId?: string | null;
  onImpulseCaptured?: () => void;
  reconcileTopics?: () => Promise<AutoTopicResult>;
};

export function VoiceHoldButton({ threadId, onImpulseCaptured, reconcileTopics }: Props) {
  const {
    captureImpulse,
    contextService,
    threadRepo,
    impulseRepo,
    archiveThread,
    observeThread,
    exportThread,
    exportOrchestrator,
  } = useAppServices();
  const setPresence = useAppStore((s) => s.setPresence);
  const pulsePresence = useAppStore((s) => s.pulsePresence);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { status, error, durationMs, interimTranscript, speechSupported, start, stop } =
    useVoiceRecorder({
      onTranscriptReady: async (voiceId, transcript) => {
        const ctx = await contextService.getCurrent();
        const queryOpts = {
          contextMode: ctx.mode,
          allowHints: true,
          hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
        };

        const cmd = await tryExecuteVoiceCommand(
          {
            threadId,
            queryOpts,
            threadRepo,
            impulseRepo,
            archiveThread,
            observeThread,
            exportThread,
            exportOrchestrator,
            reconcileTopics,
          },
          transcript,
        );

        if (cmd.handled) {
          await logEvent('voice.command', { ok: cmd.ok, transcript });
          if (cmd.message) {
            setFeedback(cmd.message);
            window.setTimeout(() => setFeedback(null), 4000);
          }
          if (cmd.ok) {
            onImpulseCaptured?.();
            pulsePresence('ready', 1800);
          }
          return;
        }

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

  const isRecording = status === 'recording';
  const isSaving = status === 'saving';
  const isActive = isRecording || isSaving;

  React.useEffect(() => {
    if (status === 'recording') {
      setPresence('listen', { hold: true });
    } else if (status === 'saving') {
      setPresence('think', { hold: true });
    } else if (status === 'idle') {
      setPresence('rest', { hold: true });
    }
  }, [status, setPresence]);

  const label = isSaving
    ? 'Speichern'
    : isRecording
      ? `Aufnahme ${msToClock(durationMs)}`
      : 'Gedrückt halten und sprechen';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      <button
        type="button"
        aria-label={label}
        onPointerDown={(e) => {
          e.preventDefault();
          if (!isActive) void start();
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
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: 999,
          border: `1px solid ${
            isRecording
              ? 'rgba(255,100,100,0.55)'
              : isSaving
                ? 'rgba(180,160,255,0.45)'
                : 'rgba(255,255,255,0.2)'
          }`,
          background: isRecording
            ? 'radial-gradient(circle at 35% 30%, rgba(255,90,90,0.35), rgba(40,12,16,0.85))'
            : isSaving
              ? 'radial-gradient(circle at 35% 30%, rgba(160,140,255,0.28), rgba(12,12,24,0.9))'
              : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
          boxShadow: isRecording
            ? '0 0 28px rgba(255,70,70,0.35), 0 10px 30px rgba(0,0,0,0.45)'
            : '0 10px 30px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(10px)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: isRecording ? 13 : 0,
          fontVariantNumeric: 'tabular-nums',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
        }}
      >
        {isSaving ? (
          <span style={{ fontSize: 18, opacity: 0.85, letterSpacing: 2 }}>…</span>
        ) : isRecording ? (
          msToClock(durationMs)
        ) : (
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.55)',
              boxShadow: '0 0 12px rgba(255,255,255,0.35)',
            }}
          />
        )}
      </button>

      {!speechSupported && status === 'idle' && (
        <div style={{ fontSize: 11, opacity: 0.45, textAlign: 'center', maxWidth: 260 }}>
          Spracherkennung: Chrome oder Edge
        </div>
      )}

      {isRecording && interimTranscript ? (
        <div
          style={{
            fontSize: 12,
            opacity: 0.75,
            lineHeight: 1.4,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          {interimTranscript}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            fontSize: 12,
            opacity: 0.9,
            color: 'rgba(255,180,180,0.95)',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 1.4,
          }}
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
