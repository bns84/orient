/**
 * ORIENT — Sprache (Web Speech API, Push-to-talk)
 * Local-first: Transkript lokal, optional Audio-Blob parallel in Dexie.
 */

export type SpeechRecognitionCtor = new () => SpeechRecognition;

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export type PushToTalkRecognizerOptions = {
  lang?: string;
  onInterim?: (text: string) => void;
};

/**
 * Läuft während Halten: continuous + interimResults.
 * `stop()` liefert finales Transkript (oder leeren String).
 */
export class PushToTalkRecognizer {
  private readonly recognition: SpeechRecognition;

  private finalParts: string[] = [];

  private interim = '';

  private stopped = false;

  constructor(options?: PushToTalkRecognizerOptions) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      throw new Error('SpeechRecognition nicht verfügbar');
    }
    this.recognition = new Ctor();
    this.recognition.lang = options?.lang ?? 'de-DE';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result?.[0]) continue;
        const piece = result[0].transcript.trim();
        if (!piece) continue;
        if (result.isFinal) {
          this.finalParts.push(piece);
        } else {
          interim += `${piece} `;
        }
      }
      this.interim = interim.trim();
      options?.onInterim?.(this.combinedText());
    };

    this.recognition.onerror = () => {
      // still: caller gets partial transcript on stop
    };
  }

  private combinedText(): string {
    const finals = this.finalParts.join(' ').trim();
    if (finals && this.interim) return `${finals} ${this.interim}`.trim();
    return finals || this.interim;
  }

  start(): void {
    this.finalParts = [];
    this.interim = '';
    this.stopped = false;
    try {
      this.recognition.start();
    } catch {
      // start() kann bei Doppelaufruf werfen — ignorieren
    }
  }

  stop(): Promise<string> {
    if (this.stopped) {
      return Promise.resolve(this.combinedText());
    }
    this.stopped = true;

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve(this.combinedText());
      };

      this.recognition.onend = finish;

      try {
        this.recognition.stop();
      } catch {
        finish();
      }

      setTimeout(finish, 2500);
    });
  }

  abort(): void {
    this.stopped = true;
    try {
      this.recognition.abort();
    } catch {
      // ignore
    }
  }
}

export function createPushToTalkRecognizer(
  options?: PushToTalkRecognizerOptions,
): PushToTalkRecognizer | null {
  if (!isSpeechRecognitionSupported()) return null;
  return new PushToTalkRecognizer(options);
}
