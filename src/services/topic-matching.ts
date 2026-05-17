/**
 * Themen-Matching & Clustering (heuristisch, DE, lokal).
 */

import type { Impulse } from '../core/impulses/Impulse';
import type { Thread } from '../core/threads/Thread';
import { ThreadStatus } from '../core/threads/ThreadStatus';

function impulseText(imp: Impulse): string {
  return (imp.content.text ?? imp.content.transcript ?? '').trim();
}

function titleFromImpulseText(text: string): string {
  const line = text.split(/\n+/)[0]?.trim() ?? '';
  const words = line.split(/\s+/).filter(Boolean);
  const short = words.slice(0, 8).join(' ');
  const base = short || 'Neuer Gedanke';
  return base.length > 64 ? `${base.slice(0, 61)}…` : base;
}

const STOPWORDS = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'eines',
  'und',
  'oder',
  'ich',
  'du',
  'wir',
  'ihr',
  'sie',
  'es',
  'ist',
  'sind',
  'war',
  'noch',
  'mal',
  'heute',
  'morgen',
  'gestern',
  'dann',
  'auch',
  'nur',
  'schon',
  'sehr',
  'mehr',
  'nach',
  'bei',
  'mit',
  'von',
  'zum',
  'zur',
  'auf',
  'aus',
  'für',
  'als',
  'wie',
  'was',
  'wer',
  'wo',
  'wenn',
  'aber',
  'dass',
  'denn',
  'hier',
  'dort',
  'dabei',
  'daran',
  'bitte',
  'ganz',
  'kurz',
  'neue',
  'neuer',
  'neues',
  'nochmal',
]);

export function normalizeTopicText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function topicTokens(s: string): string[] {
  return normalizeTopicText(s)
    .split(' ')
    .filter((w) => w.length >= 2);
}

export function significantTokens(s: string): string[] {
  return topicTokens(s).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function threadStatusOf(thread: Thread): string {
  return String(thread.status ?? ThreadStatus.ACTIVE);
}

export function isMatchableThread(thread: Thread): boolean {
  const s = threadStatusOf(thread);
  return (
    s === ThreadStatus.ACTIVE ||
    s === ThreadStatus.OBSERVED ||
    s === 'ACTIVE' ||
    s === 'OBSERVED'
  );
}

function wordsFromText(text: string): string[] {
  return normalizeTopicText(text).split(' ').filter(Boolean);
}

function tokenMatchesTitleWord(contentWords: string[], titleToken: string): boolean {
  if (titleToken.length < 3) return false;
  if (contentWords.includes(titleToken)) return true;
  return contentWords.some(
    (w) =>
      w.length >= 3 &&
      (w.startsWith(titleToken) ||
        titleToken.startsWith(w) ||
        (titleToken.length >= 4 && w.includes(titleToken)) ||
        (w.length >= 4 && titleToken.includes(w))),
  );
}

export function scoreThreadMatch(text: string, thread: Thread): number {
  const title = thread.title.trim();
  if (!title) return 0;

  const bodyNorm = normalizeTopicText(text);
  const titleNorm = normalizeTopicText(title);
  const contentWords = wordsFromText(text);
  const contentTokens = new Set(topicTokens(text));
  const titleTokenList = topicTokens(title);
  let score = 0;

  if (titleNorm.length >= 3 && bodyNorm.includes(titleNorm)) {
    score += 16;
  }

  const titleOverlap = titleTokenList.filter((t) => contentTokens.has(t)).length;
  if (titleTokenList.length > 0) {
    score += Math.round((titleOverlap / titleTokenList.length) * 12);
  }

  for (const token of titleTokenList) {
    if (contentTokens.has(token)) score += 4;
    else if (tokenMatchesTitleWord(contentWords, token)) score += 3;
  }

  for (const tag of thread.tags ?? []) {
    if (tag.startsWith('region:')) continue;
    const tagNorm = normalizeTopicText(tag);
    if (!tagNorm || tagNorm.length < 2) continue;
    if (bodyNorm.includes(tagNorm)) score += 9;
    if (contentTokens.has(tagNorm)) score += 5;
    if (tokenMatchesTitleWord(contentWords, tagNorm)) score += 3;
  }

  return score;
}

export type ThreadMatchOptions = {
  /** Mindest-Score für ein Match (Standard: 3) */
  minScore?: number;
  /** Abstand zum zweitbesten Kandidaten (Standard: 2) */
  minMargin?: number;
  /** Bei mehreren Kandidaten: Mindest-Score gegen Mehrdeutigkeit (Standard: 8) */
  minAbsoluteForAmbiguity?: number;
};

export function findBestThreadMatch(
  text: string,
  threads: Thread[],
  options?: ThreadMatchOptions,
): Thread | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const minScore = options?.minScore ?? 3;
  const minMargin = options?.minMargin ?? 2;
  const minAbsoluteForAmbiguity = options?.minAbsoluteForAmbiguity ?? 8;

  const candidates = threads.filter(isMatchableThread);
  if (candidates.length === 0) return null;

  const ranked = candidates
    .map((thread) => ({ thread, score: scoreThreadMatch(trimmed, thread) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;

  const best = ranked[0]!;
  const second = ranked[1]?.score ?? 0;

  const titleLen = best.thread.title.trim().length;
  const required = Math.max(minScore, titleLen <= 6 ? 2 : minScore);

  if (best.score < required) return null;

  if (ranked.length > 1 && best.score < second + minMargin && best.score < minAbsoluteForAmbiguity) {
    return null;
  }

  return best.thread;
}

export function findThreadByExactTitle(threads: Thread[], title: string): Thread | null {
  const want = normalizeTopicText(title);
  if (!want) return null;
  return threads.find((t) => normalizeTopicText(t.title) === want && isMatchableThread(t)) ?? null;
}

export type TopicCluster = {
  title: string;
  signature: string;
  impulses: Impulse[];
};

function dedupeImpulses(impulses: Impulse[]): Impulse[] {
  return [...new Map(impulses.map((i) => [i.id, i])).values()];
}

function clusterByExactTitle(unlinked: Impulse[]): TopicCluster | null {
  const byTitle = new Map<string, Impulse[]>();
  for (const imp of unlinked) {
    const text = impulseText(imp);
    if (!text) continue;
    const sig = normalizeTopicText(titleFromImpulseText(text));
    if (!sig) continue;
    const bucket = byTitle.get(sig) ?? [];
    bucket.push(imp);
    byTitle.set(sig, bucket);
  }

  let best: TopicCluster | null = null;
  for (const [signature, impulses] of byTitle) {
    if (impulses.length >= 2) {
      const title = titleFromImpulseText(impulseText(impulses[impulses.length - 1]!));
      if (!best || impulses.length > best.impulses.length) {
        best = { title, signature: `title:${signature}`, impulses: dedupeImpulses(impulses) };
      }
    }
  }
  return best;
}

function clusterBySharedTokens(unlinked: Impulse[]): TopicCluster | null {
  const items = unlinked
    .map((imp) => ({
      imp,
      tokens: new Set(significantTokens(impulseText(imp))),
    }))
    .filter((x) => x.tokens.size > 0);

  if (items.length < 2) return null;

  const freq = new Map<string, number>();
  for (const { tokens } of items) {
    for (const t of tokens) {
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }

  const shared = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([t]) => t);

  if (shared.length === 0) return null;

  const anchor = shared.slice(0, 3);
  const groups = new Map<string, Impulse[]>();

  for (const { imp, tokens } of items) {
    const keyParts = anchor.filter((t) => tokens.has(t));
    if (keyParts.length === 0) continue;
    const key = keyParts.join('|');
    const bucket = groups.get(key) ?? [];
    bucket.push(imp);
    groups.set(key, bucket);
  }

  let bestKey = '';
  let bestImpulses: Impulse[] = [];
  for (const [key, impulses] of groups) {
    const unique = dedupeImpulses(impulses);
    if (unique.length > bestImpulses.length) {
      bestImpulses = unique;
      bestKey = key;
    }
  }

  if (bestImpulses.length < 2) return null;

  const titleParts = bestKey.split('|').filter(Boolean);
  let title = titleParts.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(' ');
  if (title.length < 4) {
    title = titleFromImpulseText(impulseText(bestImpulses[bestImpulses.length - 1]!));
  }

  return {
    title,
    signature: `shared:${bestKey}`,
    impulses: bestImpulses,
  };
}

function clusterByKeywordToken(unlinked: Impulse[]): TopicCluster | null {
  const tokenHits = new Map<string, Impulse[]>();
  for (const imp of unlinked) {
    for (const token of significantTokens(impulseText(imp))) {
      const bucket = tokenHits.get(token) ?? [];
      bucket.push(imp);
      tokenHits.set(token, bucket);
    }
  }

  for (const [token, impulses] of [...tokenHits.entries()].sort(
    (a, b) => dedupeImpulses(b[1]).length - dedupeImpulses(a[1]).length,
  )) {
    const unique = dedupeImpulses(impulses);
    if (unique.length >= 3) {
      return {
        title: token.charAt(0).toUpperCase() + token.slice(1),
        signature: `kw:${token}`,
        impulses: unique,
      };
    }
  }
  return null;
}

/** Bestes Muster in unverknüpften Impulsen (Titel, gemeinsame Tokens, Keyword). */
export function detectTopicCluster(unlinked: Impulse[]): TopicCluster | null {
  if (unlinked.length < 2) return null;
  return (
    clusterByExactTitle(unlinked) ??
    clusterBySharedTokens(unlinked) ??
    clusterByKeywordToken(unlinked)
  );
}

/** Sofort-Zuordnung beim Erfassen — nur bei klarem Match. */
export const CAPTURE_MATCH_OPTIONS: ThreadMatchOptions = {
  minScore: 7,
  minMargin: 3,
  minAbsoluteForAmbiguity: 10,
};

/** Auto-Topic: etwas großzügiger, Engine korrigiert später. */
export const AUTO_LINK_MATCH_OPTIONS: ThreadMatchOptions = {
  minScore: 4,
  minMargin: 2,
  minAbsoluteForAmbiguity: 7,
};

export const WEAK_ASSIGNMENT_SCORE = 5;
export const REASSIGN_MIN_BEST = 4;
export const REASSIGN_MARGIN = 2;
