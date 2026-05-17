/**
 * Morgenroutine — wann zeigen, Session merken.
 */

import { kvGet, kvSet } from '../db/kv';
import { generateMorningBriefing, thoughtText } from './thought-processor';
import { isAiEnrichmentEnabled } from './ai/aiClient';
import { enrichMorningBriefingLines } from './ai/enrichMorningBriefing';
import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';
import type { ThreadRepository } from '../core/threads/ThreadRepository';
import { loadAllThreads } from './thought-processor';

const LAST_SHOWN_KEY = 'morningBriefing.lastShownDate';
const LAST_ACTIVE_KEY = 'session.lastActiveAt';
const MORNING_START_HOUR = 6;

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Erste Öffnung am Tag nach 6:00, wenn die letzte Session vor heute war. */
export async function shouldShowMorningBriefing(now = new Date()): Promise<boolean> {
  if (now.getHours() < MORNING_START_HOUR) return false;

  const today = dayKey(now);
  const lastShown = await kvGet<string | null>(LAST_SHOWN_KEY, null);
  if (lastShown === today) return false;

  const lastActive = await kvGet<number>(LAST_ACTIVE_KEY, 0);
  if (!lastActive) return true;

  return lastActive < startOfDay(now);
}

export async function markMorningBriefingShown(now = new Date()): Promise<void> {
  await kvSet(LAST_SHOWN_KEY, dayKey(now));
}

export async function touchSessionActivity(now = new Date()): Promise<void> {
  await kvSet(LAST_ACTIVE_KEY, now.getTime());
}

export async function buildMorningBriefingLines(params: {
  companionName: string;
  impulseRepo: ImpulseRepository;
  threadRepo: ThreadRepository;
  now?: Date;
}): Promise<string[]> {
  const impulses = await params.impulseRepo.findRecent(80);
  const threads = await loadAllThreads(params.threadRepo);
  const fallback = generateMorningBriefing({
    companionName: params.companionName,
    impulses,
    threads,
    now: params.now,
  });

  if (!isAiEnrichmentEnabled()) return fallback;

  const since = (params.now ?? new Date()).getTime() - 24 * 60 * 60 * 1000;
  const recent = impulses.filter((i) => i.createdAt.getTime() >= since);

  return enrichMorningBriefingLines(fallback, {
    companionName: params.companionName,
    impulseSnippets: recent.map((i) => thoughtText(i.content)).filter(Boolean),
    threadTitles: threads.map((t) => t.title),
  });
}
