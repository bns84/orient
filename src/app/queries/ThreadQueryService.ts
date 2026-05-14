/**
 * ORIENT - Thread Query Service
 * 
 * Das ist die Schicht, die ORIENT "spricht", ohne LLM.
 * Sie baut Snapshots aus Daten + Eskalation.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Transparenz statt Blackbox
 * - Kein Feed, keine Endlosliste
 */

import { ThreadRepository } from '@core/threads/ThreadRepository';
import { ImpulseRepository } from '@core/impulses/ImpulseRepository';
import { Repository } from '@core/storage/Repository';
import { Edge } from '@core/graph/Edge';
import { Thread } from '@core/threads/Thread';
import { Impulse } from '@core/impulses/Impulse';

import { EscalationEngine } from '@core/escalation/EscalationEngine';
import { ContextMode } from '@core/escalation/ContextMode';

import { ThreadSnapshot } from './types/ThreadSnapshot';
import { oneOrTwoSentences, clampList, safeBullet } from './helpers/TextDigest';

export interface ThreadQueryDeps {
  threadRepo: ThreadRepository;
  impulseRepo: ImpulseRepository;
  edgeRepo: Repository<Edge>;
}

export interface ThreadQueryOptions {
  contextMode: ContextMode;
  allowHints: boolean;
  hintBudgetRemaining: number;
}

export class ThreadQueryService {
  constructor(private deps: ThreadQueryDeps) {}

  async getThreadSnapshot(threadId: string, opts: ThreadQueryOptions): Promise<ThreadSnapshot | null> {
    const thread = await this.deps.threadRepo.getById(threadId);
    if (!thread) return null;

    const impulses = await this.deps.impulseRepo.findByThread(threadId);
    const edges = await this.deps.edgeRepo.getAll();
    const relatedEdges = edges.filter((e) => e.from.id === threadId || e.to.id === threadId);

    const lastActivityAt = this.computeLastActivityAt(impulses, relatedEdges);

    // Minimaler Signal-Bau: wir leiten Scores aus "Existenz + Aktualität" ab.
    const confidence = relatedEdges.length ? avg(relatedEdges.map((e) => e.weights.confidence)) : 0.2;
    const recency = lastActivityAt ? recencyScore(lastActivityAt) : 0.1;
    const frequency = impulses.length >= 5 ? 0.7 : impulses.length >= 2 ? 0.4 : 0.2;
    const userRelevance = thread.metrics?.userRelevanceScore ?? 0.5;

    const { level, score } = EscalationEngine.evaluate({
      threadStatus: thread.status,
      confidence,
      recency,
      frequency,
      userRelevance,
      contextMode: opts.contextMode,
      allowHints: opts.allowHints,
      hintBudgetRemaining: opts.hintBudgetRemaining,
    });

    const summary = oneOrTwoSentences(this.buildSummary(thread, impulses, relatedEdges));
    const highlights = clampList(this.buildHighlights(impulses, relatedEdges).map(safeBullet), 3);
    const uncertainties = clampList(this.buildUncertainties(confidence, recency, relatedEdges).map(safeBullet), 2);

    return {
      threadId: thread.id,
      title: thread.title,
      status: thread.status,
      tone: opts.contextMode === ContextMode.FOCUS ? 'FOCUS' : opts.contextMode === ContextMode.QUIET ? 'QUIET' : 'NORMAL',
      escalation: {
        level,
        score,
        reason: this.explainWhy(level, score, opts),
      },
      summary,
      highlights,
      uncertainties,
      provenance: {
        impulseCount: impulses.length,
        edgeCount: relatedEdges.length,
        lastActivityAt,
      },
    };
  }

  private computeLastActivityAt(impulses: Impulse[], edges: Edge[]): Date | undefined {
    const impulseDates = impulses.map((i) => new Date(i.createdAt));
    const edgeDates = edges.map((e) => new Date(e.lastSeenAt));
    const all = [...impulseDates, ...edgeDates].filter((d) => !isNaN(d.getTime()));
    if (!all.length) return undefined;
    return new Date(Math.max(...all.map((d) => d.getTime())));
  }

  private buildSummary(thread: Thread, impulses: Impulse[], edges: Edge[]): string {
    if (thread.status === 'DORMANT') {
      return 'Dieses Thema ruht gerade. Es bleibt gespeichert und kann jederzeit wieder aufgegriffen werden.';
    }
    if (thread.status === 'CLOSED') {
      return 'Dieses Thema ist abgeschlossen, bleibt aber als Erinnerung erhalten.';
    }

    if (!impulses.length) {
      return 'Noch keine Einträge. Wenn du willst, können wir es mit einem ersten Gedanken starten.';
    }

    const last = impulses.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    const hint = last?.content?.text || last?.content?.transcript || 'Letzter Impuls gespeichert.';
    const rel = edges.length ? `Es gibt bereits ${edges.length} Verknüpfungen.` : 'Noch keine stabilen Verknüpfungen.';

    return `${hint} ${rel}`;
  }

  private buildHighlights(impulses: Impulse[], edges: Edge[]): string[] {
    const last3 = impulses
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 3)
      .map((i) => i.content?.text || i.content?.transcript)
      .filter(Boolean) as string[];

    const edgeHint = edges.length ? [`Verknüpfungen aktiv: ${edges.length}`] : [];
    return [...last3, ...edgeHint].filter(Boolean);
  }

  private buildUncertainties(confidence: number, recency: number, edges: Edge[]): string[] {
    const u: string[] = [];
    if (confidence < 0.35) {
      u.push('Datenlage ist dünn; eher beobachten als schließen.');
    }
    if (recency < 0.25) {
      u.push('Lange keine Aktivität; das Thema könnte gerade schlafen.');
    }
    if (!edges.length) {
      u.push('Noch keine bestätigten Zusammenhänge verknüpft.');
    }
    return u;
  }

  private explainWhy(level: number, score: number, opts: ThreadQueryOptions): string {
    if (!opts.allowHints) {
      return 'Hinweise sind deaktiviert; ich merke nur still mit.';
    }
    if (opts.hintBudgetRemaining <= 0) {
      return 'Heute ist Ruhemodus aktiv; ich merke nur still mit.';
    }
    if (opts.contextMode === ContextMode.QUIET || opts.contextMode === ContextMode.FAMILY || opts.contextMode === ContextMode.SOCIAL) {
      return 'Kontext ist auf Ruhe gestellt; ich halte mich zurück.';
    }
    return `Verdichtung: ${Math.round(score * 100)}%. Stufe ${level}.`;
  }
}

// helpers
const avg = (arr: number[]): number => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const recencyScore = (last: Date): number => {
  const days = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 1) return 1;
  if (days <= 7) return 0.7;
  if (days <= 30) return 0.4;
  return 0.2;
};
