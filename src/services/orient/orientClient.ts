/**
 * Die App spricht nur mit dem Pförtner. Hier liegt kein Schlüssel.
 */

import { orientServerUrl } from './serverUrl';

export type AskStatus = 'ok' | 'stopped' | 'cancelled' | 'error';

export interface PfoertnerAnswer {
  status: AskStatus;
  requestId: string;
  answer: string;
  replacedBy?: string;
  model: string | null;
}

export async function askPfoertner(params: {
  text: string;
  source: 'voice' | 'text';
  requestId: string;
  companionName?: string;
}): Promise<PfoertnerAnswer> {
  try {
    const res = await fetch(`${orientServerUrl()}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return (await res.json()) as PfoertnerAnswer;
  } catch {
    return {
      status: 'error',
      requestId: params.requestId,
      answer: 'Der Pförtner ist nicht erreichbar. Läuft start-orient.bat?',
      model: null,
    };
  }
}

export async function cancelPfoertner(requestId: string): Promise<void> {
  try {
    await fetch(`${orientServerUrl()}/api/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
  } catch {
    // nichts zu tun
  }
}
