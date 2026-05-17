/**
 * ORIENT — Gedanken-Verarbeitung (Phase 1: lokal, optional KI-Stub)
 */

import type { Impulse } from '../core/impulses/Impulse';
import { ImpulseLinker } from '../core/impulses/ImpulseLinker';
import type { Thread } from '../core/threads/Thread';
import { ThreadStatus } from '../core/threads/ThreadStatus';
import type { ThreadRepository } from '../core/threads/ThreadRepository';
import type { Edge } from '../core/graph/Edge';
import { GraphLinker } from '../core/graph/GraphLinker';
import { RelationType } from '../core/graph/RelationType';
import { edgeKey } from '../core/graph/Edge';
import { logEvent } from '../db/events';
import { maybeEnrichThoughtWithAi } from './thought-processor.ai';
import {
  CAPTURE_MATCH_OPTIONS,
  findBestThreadMatch,
  findThreadByExactTitle,
} from './topic-matching';

export { findBestThreadMatch, findThreadByExactTitle, scoreThreadMatch } from './topic-matching';

export type ThoughtProcessorDeps = {
  threadRepo: ThreadRepository;
  edgeRepo: {
    getAll(): Promise<Edge[]>;
    save(edge: Edge): Promise<void>;
  };
};

export type ProcessThoughtResult = {
  impulse: Impulse;
  threadId: string;
  threadTitle?: string;
  createdThread: boolean;
  matchedExisting: boolean;
};

export function thoughtText(content: { text?: string; transcript?: string }): string {
  return (content.text ?? content.transcript ?? '').trim();
}

export function titleFromThought(text: string): string {
  const line = text.split(/\n+/)[0]?.trim() ?? '';
  const words = line.split(/\s+/).filter(Boolean);
  const short = words.slice(0, 8).join(' ');
  const base = short || 'Neuer Gedanke';
  return base.length > 64 ? `${base.slice(0, 61)}…` : base;
}

function threadStatusOf(thread: Thread): string {
  return String(thread.status ?? ThreadStatus.ACTIVE);
}

/** Alle Threads aus dem Repo (findAll oder getAll) */
export async function loadAllThreads(threadRepo: ThreadRepository): Promise<Thread[]> {
  const repo = threadRepo as ThreadRepository & { getAll?: () => Promise<Thread[]> };
  if (repo.findAll) return repo.findAll();
  if (repo.getAll) return repo.getAll();
  return [];
}

async function touchThread(threadRepo: ThreadRepository, thread: Thread, at: Date): Promise<void> {
  const next: Thread = {
    ...thread,
    updatedAt: at,
    metrics: {
      ...thread.metrics,
      recencyScore: Math.min(1, thread.metrics.recencyScore + 0.08),
      frequencyScore: Math.min(1, thread.metrics.frequencyScore + 0.05),
    },
  };
  await threadRepo.update(next);
}

async function ensureImpulseThreadEdge(
  deps: ThoughtProcessorDeps,
  impulseId: string,
  threadId: string,
  at: Date,
): Promise<void> {
  const from = { type: 'IMPULSE' as const, id: impulseId };
  const to = { type: 'THREAD' as const, id: threadId };
  const relation = RelationType.RELATED_TO;
  const key = edgeKey(from, to, relation);

  const existing = (await deps.edgeRepo.getAll()).find(
    (e) => edgeKey(e.from, e.to, e.relation) === key,
  );

  const edge = GraphLinker.link({
    existing: existing ?? null,
    from,
    to,
    relation,
    weights: {
      confidence: 0.55,
      recency: 0.85,
      frequency: 0.35,
      userRelevance: 0.7,
    },
    at,
  });

  await deps.edgeRepo.save(edge);
}

/**
 * Nach Impuls-Speicherung: Thread zuordnen (explizit, Match oder neu) + Edge.
 */
export async function processCapturedThought(
  impulse: Impulse,
  deps: ThoughtProcessorDeps,
  options?: { explicitThreadId?: string },
): Promise<ProcessThoughtResult> {
  const at = impulse.createdAt;
  const text = thoughtText(impulse.content);
  const allThreads = await loadAllThreads(deps.threadRepo);

  let thread: Thread | null = null;
  let createdThread = false;
  let matchedExisting = false;

  if (options?.explicitThreadId) {
    thread =
      (await deps.threadRepo.getById(options.explicitThreadId)) ??
      allThreads.find((t) => t.id === options.explicitThreadId) ??
      null;
    if (thread) matchedExisting = true;
  } else if (text) {
    const match = findBestThreadMatch(text, allThreads, CAPTURE_MATCH_OPTIONS);
    if (match) {
      thread = match;
      matchedExisting = true;
    } else {
      const sameTitle = findThreadByExactTitle(allThreads, titleFromThought(text));
      if (sameTitle) {
        thread = sameTitle;
        matchedExisting = true;
      }
    }
  }

  if (!thread) {
    return {
      impulse,
      threadId: '',
      createdThread: false,
      matchedExisting: false,
    };
  }

  const linked = ImpulseLinker.linkToThread(impulse, thread.id);
  await touchThread(deps.threadRepo, thread, at);
  await ensureImpulseThreadEdge(deps, linked.id, thread.id, at);

  await logEvent('thought.thread.linked', {
    impulseId: linked.id,
    threadId: thread.id,
    threadTitle: thread.title,
    createdThread,
    matchedExisting,
  });

  maybeEnrichThoughtWithAi({
    thread,
    text,
    threadRepo: deps.threadRepo,
  });

  return {
    impulse: linked,
    threadId: thread.id,
    threadTitle: thread.title,
    createdThread,
    matchedExisting,
  };
}

/** Regelbasiertes Morgen-Briefing (24h) — Phase 1 ohne KI-Pflicht */
export function generateMorningBriefing(params: {
  companionName: string;
  impulses: Impulse[];
  threads: Thread[];
  now?: Date;
}): string[] {
  const now = params.now ?? new Date();
  const since = now.getTime() - 24 * 60 * 60 * 1000;

  const recent = params.impulses.filter((i) => i.createdAt.getTime() >= since);
  const lines: string[] = [];

  const name = params.companionName || 'ORIENT';
  lines.push(`${name} — kurzer Blick auf die letzten Stunden.`);

  if (recent.length === 0) {
    lines.push('Keine neuen Gedanken in den letzten 24 Stunden.');
    return lines.slice(0, 4);
  }

  lines.push(`${recent.length} Gedanke${recent.length === 1 ? '' : 'n'} festgehalten.`);

  const threadTitles = new Map(params.threads.map((t) => [t.id, t.title]));
  const counts = new Map<string, number>();
  for (const imp of recent) {
    for (const tid of imp.links.threadIds) {
      counts.set(tid, (counts.get(tid) ?? 0) + 1);
    }
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (top.length > 0) {
    const topics = top
      .map(([id, n]) => `${threadTitles.get(id) ?? 'Thema'} (${n})`)
      .join(', ');
    lines.push(`Schwerpunkte: ${topics}.`);
  } else {
    const sample = thoughtText(recent[0]!.content);
    if (sample) {
      lines.push(`Zuletzt: „${sample.length > 48 ? `${sample.slice(0, 45)}…` : sample}“.`);
    }
  }

  const active = params.threads.filter((t) => threadStatusOf(t) === ThreadStatus.ACTIVE).length;
  if (active > 0) {
    lines.push(`${active} aktive Themen im Blick.`);
  }

  return lines.slice(0, 4);
}
