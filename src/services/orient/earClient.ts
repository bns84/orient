/**
 * Das Ohr in der App: die Aufnahme geht nur an den Pförtner, der gibt sie an den
 * Dolmetscher (Whisper) weiter. Die Browser-Spracherkennung (Google) ist nur noch ein
 * Schalter für Notfälle, nicht mehr der Normalfall.
 */

import { orientServerUrl } from './serverUrl';

export type EarMode = 'own' | 'browser';

const STORAGE_KEY = 'orient.ear';

/** Standard: eigenes Ohr. Umschalten auf Browser-Erkennung: localStorage 'orient.ear' = 'browser' oder VITE_ORIENT_EAR=browser. */
export function earMode(): EarMode {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'browser' || stored === 'own') return stored;
  } catch {
    // Speicher nicht verfügbar
  }
  return import.meta.env.VITE_ORIENT_EAR?.trim().toLowerCase() === 'browser' ? 'browser' : 'own';
}

export type HearResult = { ok: true; text: string } | { ok: false; message: string };

export async function hearPfoertner(audio: Blob, language = 'de'): Promise<HearResult> {
  try {
    const res = await fetch(`${orientServerUrl()}/api/hear?lang=${encodeURIComponent(language)}`, {
      method: 'POST',
      headers: { 'Content-Type': audio.type || 'application/octet-stream' },
      body: audio,
    });
    const json = (await res.json().catch(() => ({}))) as { text?: unknown; error?: unknown };
    if (!res.ok) {
      return {
        ok: false,
        message: typeof json.error === 'string' ? json.error : `Das Ohr antwortet nicht (Status ${res.status}).`,
      };
    }
    return { ok: true, text: typeof json.text === 'string' ? json.text.trim() : '' };
  } catch {
    return { ok: false, message: 'Der Pförtner ist nicht erreichbar. Läuft start-orient.bat?' };
  }
}
