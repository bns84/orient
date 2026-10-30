/**
 * Der Pförtner selbst: nimmt Fragen an, schickt sie durch die neun Türen,
 * hält laufende Anfragen fest (Abbrechen, Nachschieben) und rechnet mit.
 */

import { randomUUID } from 'node:crypto';
import type { Config } from './config.js';
import { ModelError, costUsd, type ChatMessage, type ModelClient } from './models/types.js';
import { newCtx, openGate, runPipeline } from './tree/pipeline.js';
import { effectiveDailyLimit, spentToday } from './tree/stations.js';
import { RequestCancelled, type Deps, type Gate, type Source, type StepLog } from './tree/types.js';
import type { Brain } from './store.js';

export interface AskInput {
  text: string;
  source?: Source;
  requestId?: string;
  companionName?: string;
}

export type AskStatus = 'ok' | 'stopped' | 'cancelled' | 'error';

export interface AskResult {
  status: AskStatus;
  requestId: string;
  answer: string;
  /** Bei „cancelled“ durch Nachschieben: die Anfrage, die jetzt weiterläuft */
  replacedBy?: string;
  model: string | null;
  rulesChanged: boolean;
  usage: { inputTokens: number; outputTokens: number; costUsd: number; costKnown: boolean };
  todayCostUsd: number;
  dailyLimitUsd: number;
  steps: StepLog[];
}

interface Running {
  requestId: string;
  text: string;
  source: Source;
  controller: AbortController;
  replacedBy: string | null;
}

export interface TaskInput {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

export type TaskResult =
  | { ok: true; text: string; inputTokens: number; outputTokens: number; costUsd: number }
  | { ok: false; reason: 'limit' | 'error'; message: string };

export class Orient {
  private readonly running = new Map<string, Running>();
  readonly deps: Deps;

  constructor(
    readonly brain: Brain,
    readonly model: ModelClient,
    readonly config: Config,
    gate: Gate = openGate,
    readonly clock: () => Date = () => new Date(),
  ) {
    this.deps = { brain, model, config, gate };
  }

  isRunning(requestId: string): boolean {
    for (const r of this.running.values()) if (r.requestId === requestId) return true;
    return false;
  }

  private snapshot(): { todayCostUsd: number; dailyLimitUsd: number } {
    const userId = this.config.userId;
    return {
      todayCostUsd: spentToday(this.deps, userId, this.clock()),
      dailyLimitUsd: effectiveDailyLimit(this.deps, userId),
    };
  }

  /** Abbrechen: die laufende Anfrage wird angehalten, es wird nichts weiter bezahlt. */
  cancel(requestId: string): boolean {
    for (const r of this.running.values()) {
      if (r.requestId === requestId) {
        r.controller.abort();
        return true;
      }
    }
    return false;
  }

  async ask(input: AskInput): Promise<AskResult> {
    const userId = this.config.userId;
    const requestId = input.requestId?.trim() || randomUUID();
    const source: Source = input.source === 'voice' ? 'voice' : 'text';
    let text = input.text.trim();

    if (!text) {
      return this.result('error', requestId, 'Da war nichts zu hören oder zu lesen.', null, [], false);
    }

    // Nachschieben: Läuft für diesen Nutzer schon eine Anfrage, wird sie angehalten,
    // und beide Sätze gehen zusammen neu los. Fertiges bleibt erhalten.
    const previous = this.running.get(userId);
    if (previous) {
      previous.replacedBy = requestId;
      previous.controller.abort();
      text = `${previous.text}\n${text}`;
    }

    const controller = new AbortController();
    const entry: Running = { requestId, text, source, controller, replacedBy: null };
    this.running.set(userId, entry);

    try {
      const ctx = newCtx({
        requestId,
        userId,
        text,
        source,
        companionName: input.companionName?.trim() || 'ORIENT',
        now: this.clock(),
        signal: controller.signal,
      });
      await runPipeline(ctx, this.deps);

      const inTokens = ctx.usage.reduce((n, u) => n + u.inputTokens, 0);
      const outTokens = ctx.usage.reduce((n, u) => n + u.outputTokens, 0);
      const cost = ctx.usage.reduce((n, u) => n + u.costUsd, 0);
      const costKnown = ctx.usage.every((u) => u.costKnown);
      const status: AskStatus = ctx.failed ? 'error' : ctx.stopped ? 'stopped' : 'ok';

      return {
        ...this.result(status, requestId, ctx.answer ?? '', ctx.modelLabel, ctx.steps, ctx.rulesChanged),
        usage: { inputTokens: inTokens, outputTokens: outTokens, costUsd: cost, costKnown },
      };
    } catch (err) {
      if (err instanceof RequestCancelled) {
        return {
          ...this.result('cancelled', requestId, '', null, [], false),
          replacedBy: entry.replacedBy ?? undefined,
        };
      }
      const message = err instanceof Error ? err.message : String(err);
      return this.result('error', requestId, `Das hat nicht geklappt: ${message}`, null, [], false);
    } finally {
      if (this.running.get(userId) === entry) this.running.delete(userId);
    }
  }

  private result(
    status: AskStatus,
    requestId: string,
    answer: string,
    model: string | null,
    steps: StepLog[],
    rulesChanged: boolean,
  ): AskResult {
    return {
      status,
      requestId,
      answer,
      model,
      rulesChanged,
      usage: { inputTokens: 0, outputTokens: 0, costUsd: 0, costKnown: true },
      ...this.snapshot(),
      steps,
    };
  }

  /**
   * Einzelaufgabe für die App (zum Beispiel „Gedanke anreichern“): kein Gespräch,
   * keine Regeln, nur Kostenbremse + Modell + Kostenzähler.
   */
  async task(input: TaskInput): Promise<TaskResult> {
    const userId = this.config.userId;
    const limit = effectiveDailyLimit(this.deps, userId);
    const spent = spentToday(this.deps, userId, this.clock());
    if (spent >= limit) {
      return { ok: false, reason: 'limit', message: 'Das Tageslimit ist erreicht.' };
    }
    if (!this.model.ready) {
      return { ok: false, reason: 'error', message: `Es fehlt der Schlüssel für ${this.model.label}.` };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
    try {
      const res = await this.model.complete({
        system: input.system,
        messages: input.messages,
        maxTokens: input.maxTokens ?? this.config.maxTokens,
        signal: controller.signal,
      });
      const cost = costUsd(this.model.prices, res.inputTokens, res.outputTokens);
      this.brain.addUsage({
        userId,
        requestId: randomUUID(),
        station: 'aufgabe',
        model: this.model.model,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
        costUsd: cost,
        costKnown: res.usageKnown,
        createdAt: this.clock().getTime(),
      });
      return {
        ok: true,
        text: res.text,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
        costUsd: cost,
      };
    } catch (err) {
      const message = err instanceof ModelError ? err.message : err instanceof Error ? err.message : String(err);
      return { ok: false, reason: 'error', message };
    } finally {
      clearTimeout(timer);
    }
  }
}
