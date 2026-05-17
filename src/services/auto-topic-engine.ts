/**
 * Auto-Topic-Engine — Themen selbst erlernen, Impulse nachträglich zuordnen.
 * Keine Nutzer-Entscheidung (kein Ja/Nein).
 */

import type { Impulse } from '../core/impulses/Impulse';
import { ImpulseLinker } from '../core/impulses/ImpulseLinker';
import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';
import type { Thread } from '../core/threads/Thread';
import { ThreadStatus } from '../core/threads/ThreadStatus';
import { makeTopicKey } from '../db/topics';
import { logEvent } from '../db/events';
import { hasRegionTag, regionTagForText, withRegionTag } from '../components/Bubble/regionFromThread';
import { loadAllThreads, thoughtText, type ThoughtProcessorDeps } from './thought-processor';
import {
  AUTO_LINK_MATCH_OPTIONS,
  detectTopicCluster,
  findBestThreadMatch,
  findThreadByExactTitle,
  REASSIGN_MARGIN,
  REASSIGN_MIN_BEST,
  scoreThreadMatch,
  significantTokens,
  type TopicCluster,
  WEAK_ASSIGNMENT_SCORE,
} from './topic-matching';
import { GraphLinker } from '../core/graph/GraphLinker';
import { RelationType } from '../core/graph/RelationType';
import { edgeKey } from '../core/graph/Edge';

const RECENT_LIMIT = 128;
const CLUSTER_ROUNDS = 6;

export type AutoTopicDeps = ThoughtProcessorDeps & {
  impulseRepo: ImpulseRepository;
};

export type AutoTopicRunOptions = {
  /** `recent` = letzte Impulse; `full` = alle (periodische Neu-Sortierung) */
  scope?: 'recent' | 'full';
};

export type AutoTopicResult = {
  threadsCreated: number;
  impulsesLinked: number;
  impulsesReassigned: number;
  lastThreadId?: string;
  lastThreadTitle?: string;
};

function isUnlinked(impulse: Impulse): boolean {
  return impulse.links.threadIds.length === 0;
}

async function loadImpulsesForRun(
  deps: AutoTopicDeps,
  scope: 'recent' | 'full',
): Promise<Impulse[]> {
  if (scope === 'full') {
    const all = await deps.impulseRepo.getAll();
    return all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return deps.impulseRepo.findRecent(RECENT_LIMIT);
}

async function ensureEdge(deps: ThoughtProcessorDeps, impulseId: string, threadId: string, at: Date) {
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
    weights: { confidence: 0.6, recency: 0.9, frequency: 0.4, userRelevance: 0.75 },
    at,
  });
  await deps.edgeRepo.save(edge);
}

async function touchThread(
  threadRepo: ThoughtProcessorDeps['threadRepo'],
  thread: Thread,
  at: Date,
  corpus?: string,
) {
  let next: Thread = {
    ...thread,
    updatedAt: at,
    metrics: {
      ...thread.metrics,
      recencyScore: Math.min(1, thread.metrics.recencyScore + 0.08),
      frequencyScore: Math.min(1, thread.metrics.frequencyScore + 0.05),
    },
  };
  if (corpus && !hasRegionTag(next)) {
    next = withRegionTag(next, corpus);
  }
  await threadRepo.update(next);
}

async function backfillThreadRegionTags(deps: AutoTopicDeps, threads: Thread[]): Promise<number> {
  let updated = 0;
  for (const thread of threads) {
    if (hasRegionTag(thread)) continue;
    const linked = await deps.impulseRepo.findByThread(thread.id);
    const corpus = [
      thread.title,
      thread.description ?? '',
      ...linked.map((i) => thoughtText(i.content)),
    ].join(' ');
    const patched = withRegionTag(thread, corpus);
    await deps.threadRepo.update(patched);
    updated++;
  }
  return updated;
}

async function linkImpulseToThread(
  deps: AutoTopicDeps,
  impulse: Impulse,
  threadId: string,
  threads: Thread[],
): Promise<Impulse> {
  if (impulse.links.threadIds.includes(threadId)) return impulse;

  let next = impulse;
  for (const oldId of [...impulse.links.threadIds]) {
    next = ImpulseLinker.unlinkFromThread(next, oldId);
  }
  next = ImpulseLinker.linkToThread(next, threadId);
  await deps.impulseRepo.save(next);
  await ensureEdge(deps, next.id, threadId, next.createdAt);

  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    const corpus = `${thread.title} ${thoughtText(impulse.content)}`;
    await touchThread(deps.threadRepo, thread, next.createdAt, corpus);
  }

  return next;
}

function tokenizeForTags(s: string): string[] {
  return significantTokens(s).slice(0, 4);
}

async function createThreadFromCluster(
  deps: AutoTopicDeps,
  cluster: TopicCluster,
  threads: Thread[],
): Promise<Thread> {
  const at = new Date();
  const existing = findThreadByExactTitle(threads, cluster.title);
  if (existing) return existing;

  const corpus = [
    cluster.title,
    ...cluster.impulses.map((i) => thoughtText(i.content)),
  ].join(' ');
  const regionTag = regionTagForText(corpus);
  const keywordTags = tokenizeForTags(cluster.title);
  const tags = [regionTag, ...keywordTags.filter((t) => `region:${t}` !== regionTag)];

  const thread: Thread = {
    id: makeTopicKey(),
    title: cluster.title,
    status: ThreadStatus.ACTIVE,
    createdAt: at,
    updatedAt: at,
    tags,
    metrics: {
      recencyScore: 0.75,
      frequencyScore: 0.3,
      confidenceScore: 0.5,
      userRelevanceScore: 0.8,
    },
  };
  await deps.threadRepo.save(thread);
  await logEvent('autoTopic.created', {
    threadId: thread.id,
    title: thread.title,
    impulseCount: cluster.impulses.length,
    signature: cluster.signature,
  });
  threads.push(thread);
  return thread;
}

function shouldReassign(
  currentScore: number,
  bestScore: number,
  wasUnlinked: boolean,
): boolean {
  if (wasUnlinked) return true;
  if (bestScore >= REASSIGN_MIN_BEST && bestScore >= currentScore + REASSIGN_MARGIN) return true;
  if (currentScore < WEAK_ASSIGNMENT_SCORE && bestScore >= REASSIGN_MIN_BEST) return true;
  return false;
}

/**
 * Vollständige Abgleich-Runde: unverknüpfte Impulse zuordnen, Muster → Thema,
 * schwache Zuordnungen nachträglich korrigieren.
 */
export async function runAutoTopicEngine(
  deps: AutoTopicDeps,
  options?: AutoTopicRunOptions,
): Promise<AutoTopicResult> {
  const scope = options?.scope ?? 'recent';
  const result: AutoTopicResult = {
    threadsCreated: 0,
    impulsesLinked: 0,
    impulsesReassigned: 0,
  };

  let threads = await loadAllThreads(deps.threadRepo);
  let impulses = await loadImpulsesForRun(deps, scope);

  // Pass 1: unverknüpfte Impulse an bestehende Themen
  for (const imp of impulses.filter(isUnlinked)) {
    const text = thoughtText(imp.content);
    if (!text) continue;
    const match = findBestThreadMatch(text, threads, AUTO_LINK_MATCH_OPTIONS);
    if (!match) continue;
    await linkImpulseToThread(deps, imp, match.id, threads);
    result.impulsesLinked++;
    result.lastThreadId = match.id;
    result.lastThreadTitle = match.title;
  }

  // Pass 2: Muster → neues Thema (mehrere Cluster-Runden)
  for (let round = 0; round < CLUSTER_ROUNDS; round++) {
    impulses = await loadImpulsesForRun(deps, scope);
    const unlinked = impulses.filter(isUnlinked);
    const cluster = detectTopicCluster(unlinked);
    if (!cluster) break;

    const hadThread = findThreadByExactTitle(threads, cluster.title);
    const thread = await createThreadFromCluster(deps, cluster, threads);
    if (!hadThread) result.threadsCreated++;

    for (const imp of cluster.impulses) {
      const fresh = (await deps.impulseRepo.getById(imp.id)) ?? imp;
      if (!isUnlinked(fresh)) continue;
      await linkImpulseToThread(deps, fresh, thread.id, threads);
      result.impulsesLinked++;
    }
    result.lastThreadId = thread.id;
    result.lastThreadTitle = thread.title;
    threads = await loadAllThreads(deps.threadRepo);
  }

  // Pass 3: Neu-Sortierung — besseres Thema gewinnt (alle Impulse der Runde)
  impulses = await loadImpulsesForRun(deps, scope);
  threads = await loadAllThreads(deps.threadRepo);

  for (const imp of impulses) {
    const text = thoughtText(imp.content);
    if (!text) continue;

    const best = findBestThreadMatch(text, threads, AUTO_LINK_MATCH_OPTIONS);
    if (!best) continue;

    const currentId = imp.links.threadIds[0];
    if (!currentId) continue;
    if (currentId === best.id) continue;

    const current = threads.find((t) => t.id === currentId);
    const currentScore = current ? scoreThreadMatch(text, current) : 0;
    const bestScore = scoreThreadMatch(text, best);
    const wasUnlinked = isUnlinked(imp);

    if (!shouldReassign(currentScore, bestScore, wasUnlinked)) continue;

    await linkImpulseToThread(deps, imp, best.id, threads);
    if (wasUnlinked) result.impulsesLinked++;
    else result.impulsesReassigned++;
    result.lastThreadId = best.id;
    result.lastThreadTitle = best.title;
  }

  threads = await loadAllThreads(deps.threadRepo);
  const regionTagsBackfilled = await backfillThreadRegionTags(deps, threads);

  if (
    result.threadsCreated > 0 ||
    result.impulsesLinked > 0 ||
    result.impulsesReassigned > 0 ||
    regionTagsBackfilled > 0
  ) {
    await logEvent('autoTopic.reconcile', {
      scope,
      created: result.threadsCreated,
      linked: result.impulsesLinked,
      reassigned: result.impulsesReassigned,
      regionTagsBackfilled,
    });
  }

  return result;
}

/** Nach neuem Impuls: Engine läuft still im Hintergrund. */
export async function afterImpulseInCollection(
  _impulse: Impulse,
  deps: AutoTopicDeps,
): Promise<AutoTopicResult> {
  return runAutoTopicEngine(deps, { scope: 'recent' });
}
