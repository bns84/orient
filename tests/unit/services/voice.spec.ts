import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  PushToTalkRecognizer,
} from '../../../src/services/voice';

describe('voice service', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalWindow) {
      vi.stubGlobal('window', originalWindow);
    }
  });

  it('reports unsupported without SpeechRecognition', () => {
    vi.stubGlobal('window', {} as Window);
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(getSpeechRecognitionCtor()).toBeNull();
  });

  it('combines final and interim results on stop', async () => {
    class MockRecognition {
      lang = 'de-DE';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((e: SpeechRecognitionEvent) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      start() {
        queueMicrotask(() => {
          this.onresult?.({
            resultIndex: 0,
            results: [
              { isFinal: true, 0: { transcript: 'Hallo' } },
              { isFinal: false, 0: { transcript: ' Welt' } },
            ],
          } as unknown as SpeechRecognitionEvent);
        });
      }

      stop() {
        queueMicrotask(() => this.onend?.());
      }

      abort() {
        queueMicrotask(() => this.onend?.());
      }
    }

    vi.stubGlobal('window', {
      SpeechRecognition: MockRecognition,
    } as unknown as Window);

    const rec = new PushToTalkRecognizer();
    rec.start();
    const text = await rec.stop();
    expect(text).toContain('Hallo');
  });
});
