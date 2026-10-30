/**
 * Das Ohr des Pförtners. Der Pförtner hört nicht selbst zu, er reicht die Aufnahme
 * an den Dolmetscher weiter (ein kleines Programm mit Whisper, läuft auf diesem Rechner).
 * Die Adresse des Dolmetschers ist die vierte Schraube: ORIENT_EAR_URL.
 */

export interface EarResult {
  text: string;
  language?: string;
}

export class EarError extends Error {
  constructor(
    message: string,
    /** true = der Dolmetscher läuft nicht / ist nicht erreichbar */
    readonly unreachable = false,
  ) {
    super(message);
  }
}

export interface Ear {
  readonly mode: 'whisper' | 'mock';
  /** Ist der Dolmetscher da und bereit? */
  ready(): Promise<boolean>;
  transcribe(audio: Buffer, mime: string, language: string): Promise<EarResult>;
}

/** Spricht mit dem Dolmetscher-Programm (Python, Whisper). */
export class HttpEar implements Ear {
  readonly mode = 'whisper' as const;

  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  async ready(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async transcribe(audio: Buffer, mime: string, language: string): Promise<EarResult> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/transcribe?lang=${encodeURIComponent(language)}`, {
        method: 'POST',
        headers: { 'content-type': mime || 'application/octet-stream' },
        body: new Uint8Array(audio),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new EarError(
        'Der Dolmetscher ist nicht erreichbar. Läuft er? (start-orient.bat startet ihn, wenn Python da ist.)',
        true,
      );
    }
    if (!res.ok) {
      let detail = `Status ${res.status}`;
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) detail = j.error;
      } catch {
        // egal
      }
      throw new EarError(`Der Dolmetscher konnte die Aufnahme nicht verstehen: ${detail}`);
    }
    const j = (await res.json()) as { text?: unknown; language?: unknown };
    return {
      text: typeof j.text === 'string' ? j.text.trim() : '',
      language: typeof j.language === 'string' ? j.language : undefined,
    };
  }
}

/** Ersatz für Tests und für den Versuch ohne Python: liefert einen festen Satz. */
export class MockEar implements Ear {
  readonly mode = 'mock' as const;
  calls: { bytes: number; mime: string; language: string }[] = [];

  constructor(private readonly reply = 'Das ist ein Testsatz vom Ersatz-Ohr.') {}

  async ready(): Promise<boolean> {
    return true;
  }

  async transcribe(audio: Buffer, mime: string, language: string): Promise<EarResult> {
    this.calls.push({ bytes: audio.length, mime, language });
    return { text: this.reply, language };
  }
}
