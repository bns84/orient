/**
 * Die Steckdose für die KI: Jedes Modell steckt hier mit derselben Schnittstelle an.
 * Heute Claude und ChatGPT, später ein eigenes Modell im Keller.
 */

import type { ModelChoice, Prices } from '../config.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ModelRequest {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  signal: AbortSignal;
}

export interface ModelResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  /** false = der Anbieter hat keine Tokenzahlen geliefert, Kosten unbekannt */
  usageKnown: boolean;
}

export interface ModelClient {
  readonly id: ModelChoice;
  readonly label: string;
  readonly model: string;
  /** false = es fehlt der Schlüssel */
  readonly ready: boolean;
  readonly prices: Prices;
  complete(request: ModelRequest): Promise<ModelResponse>;
}

export type ModelErrorCode = 'no_key' | 'http' | 'network' | 'empty' | 'aborted';

export class ModelError extends Error {
  constructor(
    readonly code: ModelErrorCode,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

export function costUsd(prices: Prices, inputTokens: number, outputTokens: number): number {
  return (inputTokens * prices.inputPerMillion + outputTokens * prices.outputPerMillion) / 1_000_000;
}

export function shorten(text: string, max = 300): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Fehlertext aus einer Anbieter-Antwort holen ({"error":{"message":"…"}}). */
export function extractApiError(bodyText: string): string {
  try {
    const parsed = JSON.parse(bodyText) as { error?: { message?: string } | string };
    if (typeof parsed.error === 'string') return shorten(parsed.error);
    if (parsed.error?.message) return shorten(parsed.error.message);
  } catch {
    // kein JSON
  }
  return shorten(bodyText);
}
