/**
 * ORIENT - Interest API
 * 
 * Weiches Interesse-System ohne Favoritenliste.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (weiche Gewichtung)
 * - Keine automatische Löschung (Interesse bleibt erhalten)
 * - Transparenz (Gewichtung ist ableitbar)
 */

import { orientDb } from './orientDb';
import { logEvent } from './events';

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type EngagementKind = 'impulse' | 'focus';

const ENGAGEMENT_STRENGTH: Record<EngagementKind, number> = {
  impulse: 7,
  focus: 3,
};

/** Wichtigkeit aus Nutzung ableiten (Gedanke, Fokus auf Thema). */
export async function recordTopicEngagement(topicKey: string, kind: EngagementKind) {
  if (kind === 'focus') {
    const row = await orientDb.interest.get(topicKey);
    if (row?.lastBumpAt && Date.now() - row.lastBumpAt < 5 * 60_000) {
      return row.weight ?? 0;
    }
  }
  return bumpInterest(topicKey, ENGAGEMENT_STRENGTH[kind]);
}

export async function bumpInterest(topicKey: string, strength = 8) {
  const now = Date.now();
  const row = await orientDb.interest.get(topicKey);

  const nextWeight = clamp((row?.weight ?? 0) + strength, 0, 100);

  await orientDb.interest.put({
    key: topicKey,
    weight: nextWeight,
    lastBumpAt: now,
  });

  await logEvent('interest.bump', { topicKey, strength, nextWeight });
  return nextWeight;
}

export async function getInterest(topicKey: string) {
  return orientDb.interest.get(topicKey);
}

/**
 * Sort topics by interest weight (desc),
 * but keep it soft: only reorder within small bands.
 */
export async function rankTopics<T extends { key: string }>(topics: T[]) {
  const keys = topics.map((t) => t.key);
  const rows = await orientDb.interest.where('key').anyOf(keys).toArray();
  const map = new Map(rows.map((r) => [r.key, r.weight]));

  // soft score: base random-ish stable offset to avoid "hard favorites"
  // (here: keep original order as base; weight only nudges)
  return [...topics]
    .map((t, idx) => ({
      t,
      score: (map.get(t.key) ?? 0) * 0.8 + (topics.length - idx) * 0.2,
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
}
