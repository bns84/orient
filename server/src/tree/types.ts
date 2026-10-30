/**
 * Der Verhaltensbaum: ein Flur mit neun Türen (Stationen).
 * Jede Tür hat einen klaren Eingang und Ausgang und lässt sich austauschen,
 * ergänzen oder abschalten (Spezifikation Abschnitt 1).
 */

import type { Config } from '../config.js';
import type { ChatMessage, ModelClient } from '../models/types.js';
import type { Brain, Rule } from '../store.js';

export type Source = 'text' | 'voice';

export interface UsageEntry {
  station: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costKnown: boolean;
}

export type StepState = 'ok' | 'leer' | 'uebersprungen' | 'gestoppt';

export interface StepLog {
  id: number;
  name: string;
  state: StepState;
  ms: number;
  note?: string;
}

export interface Ctx {
  requestId: string;
  userId: string;
  source: Source;
  companionName: string;
  /** Text des Nutzers (bei Nachschieben: alles zusammengeführt) */
  text: string;
  now: Date;
  signal: AbortSignal;

  // Tür 1
  lastMessageAt: number | null;
  sinceLastMs: number | null;
  timeLine: string;

  // Tür 2
  rules: Rule[];
  rulesChanged: boolean;

  // Tür 3
  taskNotes: string[];

  // Tür 4/5
  system: string;
  messages: ChatMessage[];

  // Tür 6/8
  modelText: string | null;
  modelLabel: string | null;

  // Ergebnis
  answer: string | null;
  /** true = Antwort kam ohne KI zustande (Befehl, Kostenbremse, Fehler) */
  shortCircuit: boolean;
  /** false = nichts in den Gesprächsverlauf schreiben */
  persist: boolean;
  failed: boolean;
  stopped: boolean;

  usage: UsageEntry[];
  steps: StepLog[];
}

/** Die Datenschleuse (Tür 5): im ersten Wurf ein leerer Steckplatz, alles geht durch. */
export interface Gate {
  outbound(ctx: Ctx): void | Promise<void>;
  inbound(ctx: Ctx): void | Promise<void>;
}

export interface Deps {
  brain: Brain;
  model: ModelClient;
  config: Config;
  gate: Gate;
}

export interface StationResult {
  state?: StepState;
  note?: string;
}

export interface Station {
  id: number;
  name: string;
  /** Wird übersprungen, wenn die Antwort schon ohne KI feststeht (Befehl, Kostenbremse, Fehler). */
  skippable: boolean;
  run(ctx: Ctx, deps: Deps): Promise<StationResult | void> | StationResult | void;
}

export class RequestCancelled extends Error {
  constructor() {
    super('abgebrochen');
    this.name = 'RequestCancelled';
  }
}
