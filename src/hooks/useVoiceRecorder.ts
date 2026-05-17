/**
 * ORIENT - Voice Recorder Hook
 *
 * Press & Hold: MediaRecorder (Blob) + Web Speech API (Transkript).
 */

import { useCallback, useRef, useState } from 'react';
import { orientDb } from '../db/orientDb';
import { logEvent } from '../db/events';
import { enforceVoiceRetention } from '../db/voiceRetention';
import {
  createPushToTalkRecognizer,
  isSpeechRecognitionSupported,
  type PushToTalkRecognizer,
} from '../services/voice';

type Status = 'idle' | 'arming' | 'recording' | 'saving' | 'error';

export type VoiceRecorderOptions = {
  onTranscriptReady?: (voiceId: number, transcript: string) => void | Promise<void>;
  onInterimTranscript?: (text: string) => void;
};

export function useVoiceRecorder(options?: VoiceRecorderOptions) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRef = useRef<PushToTalkRecognizer | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTsRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

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

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const ensureMic = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      setInterimTranscript('');
      setStatus('arming');
      await logEvent('voice.start');

      const stream = await ensureMic();

      speechRef.current = createPushToTalkRecognizer({
        lang: 'de-DE',
        onInterim: (text) => {
          setInterimTranscript(text);
          optionsRef.current?.onInterimTranscript?.(text);
        },
      });
      speechRef.current?.start();

      if (!isSpeechRecognitionSupported()) {
        await logEvent('voice.transcription.unsupported', {});
      }

      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

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

          await logEvent('voice.transcription.requested', { id: voiceId });
          await orientDb.voice.update(voiceId, {
            status: 'pending',
            note: '⏳ Transkribiere…',
          });

          let transcript = '';
          const speech = speechRef.current;
          speechRef.current = null;

          if (speech) {
            try {
              transcript = (await speech.stop()).trim();
            } catch (err) {
              await logEvent('voice.transcription.error', {
                id: voiceId,
                message: err instanceof Error ? err.message : String(err),
              });
            }
          }

          setInterimTranscript('');

          if (transcript) {
            await orientDb.voice.update(voiceId, {
              status: 'done',
              note: 'Transkription',
              transcript,
            });
            await logEvent('voice.transcription.done', { id: voiceId, length: transcript.length });
            await optionsRef.current?.onTranscriptReady?.(voiceId, transcript);
          } else {
            const note = isSpeechRecognitionSupported()
              ? 'Kein Text erkannt'
              : 'Spracherkennung nicht verfügbar (z. B. Chrome/Edge)';
            await orientDb.voice.update(voiceId, {
              status: 'done',
              note,
            });
            await logEvent('voice.transcription.empty', { id: voiceId });
          }

          await enforceVoiceRetention({ maxItems: 50, maxAgeDays: 14 });
          releaseMic();

          setStatus('idle');
          setDurationMs(0);
        } catch (err) {
          setStatus('error');
          const errorMessage = err instanceof Error ? err.message : 'Save failed';
          setError(errorMessage);
          await logEvent('voice.error', { message: errorMessage });
          releaseMic();
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
      speechRef.current?.abort();
      speechRef.current = null;
      releaseMic();
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

  return {
    status,
    error,
    durationMs,
    interimTranscript,
    speechSupported: isSpeechRecognitionSupported(),
    start,
    stop,
  };
}
