/**
 * ORIENT - Voice Recorder Hook
 * 
 * Press & Hold recording (MediaRecorder) saved to IndexedDB.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (Blobs lokal gespeichert)
 * - Transparenz (Status sichtbar)
 */

import { useCallback, useRef, useState } from 'react';
import { orientDb } from '../db/orientDb';
import { logEvent } from '../db/events';
import { enforceVoiceRetention } from '../db/voiceRetention';

type Status = 'idle' | 'arming' | 'recording' | 'saving' | 'error';

export type VoiceRecorderOptions = {
  onTranscriptReady?: (voiceId: number, transcript: string) => void | Promise<void>;
};

export function useVoiceRecorder(options?: VoiceRecorderOptions) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTsRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const tickStart = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!startTsRef.current) return;
      setDurationMs(Date.now() - startTsRef.current);
    }, 100);
  };

  const tickStop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const ensureMic = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      setStatus('arming');
      await logEvent('voice.start');

      const stream = await ensureMic();

      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
      const mimeType =
        mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      chunksRef.current = [];
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        try {
          setStatus('saving');
          tickStop();

          const blob = new Blob(chunksRef.current, {
            type: mr.mimeType || 'audio/webm',
          });
          const dur = Date.now() - startTsRef.current;

          const voiceId = await orientDb.voice.add({
            createdAt: Date.now(),
            durationMs: dur,
            mimeType: mr.mimeType || 'audio/webm',
            blob,
            status: 'recorded' as const,
          });

          await logEvent('voice.saved', {
            id: voiceId,
            durationMs: dur,
            mimeType: mr.mimeType || 'audio/webm',
          });

          // Voice Phase 2: Transcription Stub
          await logEvent('voice.transcription.requested', { id: voiceId });
          await orientDb.voice.update(voiceId, {
            status: 'pending',
            note: '⏳ Transcribing…',
          });

          // Fake async transcription (stub)
          setTimeout(async () => {
            const transcript =
              'Sprachnotiz (Stub-Transkript) — echte Transkription folgt in Phase 2.';
            await orientDb.voice.update(voiceId, {
              status: 'done',
              note: 'Transcription complete (stub)',
              transcript,
            });
            await logEvent('voice.transcription.done', { id: voiceId });
            await options?.onTranscriptReady?.(voiceId, transcript);
          }, 1200);

          await enforceVoiceRetention({ maxItems: 50, maxAgeDays: 14 });

          // release mic
          stream.getTracks().forEach((t) => t.stop());

          setStatus('idle');
          setDurationMs(0);
        } catch (err) {
          setStatus('error');
          const errorMessage = err instanceof Error ? err.message : 'Save failed';
          setError(errorMessage);
          await logEvent('voice.error', { message: errorMessage });
        }
      };

      mediaRecorderRef.current = mr;
      startTsRef.current = Date.now();
      setDurationMs(0);
      tickStart();

      mr.start();
      setStatus('recording');
    } catch (err) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Mic init failed';
      setError(errorMessage);
      await logEvent('voice.error', { message: errorMessage });
    }
  }, [ensureMic]);

  const stop = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === 'recording') {
      await logEvent('voice.stop');
      mr.stop();
    }
  }, []);

  return { status, error, durationMs, start, stop };
}
