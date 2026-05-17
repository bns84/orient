/**
 * Wissens-Snapshot für die Bubble — Kern (Sammelcontainer) + Regionen.
 */

import type { Impulse } from '../../core/impulses/Impulse';
import type { Thread } from '../../core/threads/Thread';
import { thoughtText } from '../../services/thought-processor';
import { regionIndexForThread, regionIndexFromText } from './regionFromThread';

export const BUBBLE_REGION_COUNT = 8;

export type BubbleKnowledgeSnapshot = {
  totalImpulses: number;
  unlinkedInCore: number;
  /** 0..1 pro Region */
  regionFill: number[];
  /** Anteil bereits einsortiert (0 = alles im Kern) */
  maturity: number;
  /** Basis-Netz-Sichtbarkeit */
  activation: number;
  /** Kern-Dichte 0..1 */
  coreFill: number;
};

function emptySnapshot(): BubbleKnowledgeSnapshot {
  return {
    totalImpulses: 0,
    unlinkedInCore: 0,
    regionFill: Array(BUBBLE_REGION_COUNT).fill(0),
    maturity: 0,
    activation: 0.06,
    coreFill: 0.15,
  };
}

export function buildBubbleKnowledge(
  impulses: Impulse[],
  threads: Thread[],
): BubbleKnowledgeSnapshot {
  if (impulses.length === 0) return emptySnapshot();

  const threadById = new Map(threads.map((t) => [t.id, t]));
  const regionCounts = Array(BUBBLE_REGION_COUNT).fill(0);
  let unlinked = 0;

  for (const imp of impulses) {
    const text = thoughtText(imp.content);
    const tid = imp.links.threadIds[0];
    if (!tid) {
      unlinked++;
      continue;
    }
    const thread = threadById.get(tid);
    const region = thread ? regionIndexForThread(thread) : regionIndexFromText(text);
    regionCounts[region]! += 1;
  }

  const total = impulses.length;
  const linked = total - unlinked;
  const maturity = total > 0 ? linked / total : 0;

  const maxRegion = Math.max(1, ...regionCounts);
  const regionFill = regionCounts.map((c) =>
    c === 0 ? 0 : Math.min(1, 0.25 + (c / maxRegion) * 0.75),
  );

  const coreFill = Math.min(1, 0.2 + (unlinked / Math.max(1, total)) * 0.85);
  const activation = Math.min(
    1,
    0.1 + Math.log10(1 + total) * 0.22 + maturity * 0.35,
  );

  return {
    totalImpulses: total,
    unlinkedInCore: unlinked,
    regionFill,
    maturity,
    activation,
    coreFill,
  };
}

/** Region mit größtem Zugewinn seit letztem Snapshot (für Sortier-Puls). */
export function detectSortHighlightRegion(
  prev: BubbleKnowledgeSnapshot | null,
  next: BubbleKnowledgeSnapshot,
): number | null {
  if (!prev || prev.totalImpulses === 0) return null;
  let best = -1;
  let bestDelta = 0.08;
  for (let i = 0; i < BUBBLE_REGION_COUNT; i++) {
    const d = next.regionFill[i]! - prev.regionFill[i]!;
    if (d > bestDelta) {
      bestDelta = d;
      best = i;
    }
  }
  return best >= 0 ? best : null;
}
