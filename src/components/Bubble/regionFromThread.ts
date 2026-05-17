/**
 * Thread/Text → Bubble-Region (0–7), heuristisch & stabil.
 * Tags: `region:emotion` … `region:instinct` (siehe bubbleRegions.ts).
 */

import type { Thread } from '../../core/threads/Thread';
import { BUBBLE_REGIONS } from './bubbleRegions';

const REGION_KEYWORDS: Record<(typeof BUBBLE_REGIONS)[number]['id'], string[]> = {
  emotion: ['gefühl', 'emotion', 'angst', 'freude', 'traur', 'herz', 'stimmung'],
  social: ['sozial', 'team', 'famil', 'freund', 'menschen', 'kolleg', 'bezieh'],
  language: ['sprache', 'text', 'wort', 'schreib', 'lesen', 'kommunik', 'gespräch'],
  logic: ['logik', 'struktur', 'code', 'tech', 'system', 'daten', 'analyse', 'modell'],
  memory: ['erinner', 'gedächtn', 'gestern', 'vergang', 'history', 'archiv', 'notiz'],
  strategy: ['strateg', 'ziel', 'projekt', 'roadmap', 'prior', 'planung', 'budget'],
  creative: ['kreativ', 'idee', 'design', 'kunst', 'musik', 'entwurf', 'vision'],
  instinct: ['instinkt', 'schnell', 'jetzt', 'dring', 'sofort', 'alarm', 'warn'],
};

function hashStable(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function regionIdFromText(text: string): (typeof BUBBLE_REGIONS)[number]['id'] {
  const lower = text.toLowerCase();
  for (const region of BUBBLE_REGIONS) {
    const words = REGION_KEYWORDS[region.id];
    if (words.some((w) => lower.includes(w))) return region.id;
  }
  return BUBBLE_REGIONS[hashStable(lower) % BUBBLE_REGIONS.length]!.id;
}

export function regionIndexFromId(regionId: string): number {
  const idx = BUBBLE_REGIONS.findIndex((r) => r.id === regionId);
  return idx >= 0 ? idx : 0;
}

export function regionIndexFromText(text: string): number {
  return regionIndexFromId(regionIdFromText(text));
}

export function regionTagForText(text: string): string {
  return `region:${regionIdFromText(text)}`;
}

export function hasRegionTag(thread: Thread): boolean {
  return thread.tags?.some((t) => t.startsWith('region:')) ?? false;
}

/** Setzt `region:…`, wenn noch keins vorhanden (bestehende Tags bleiben erhalten). */
export function withRegionTag(thread: Thread, corpus: string): Thread {
  if (hasRegionTag(thread)) return thread;
  const regionTag = regionTagForText(corpus || thread.title);
  const tags = [regionTag, ...(thread.tags ?? []).filter((t) => !t.startsWith('region:'))];
  return { ...thread, tags, updatedAt: new Date() };
}

export function regionIndexForThread(thread: Thread): number {
  const tag = thread.tags?.find((t) => t.startsWith('region:'))?.slice(7);
  if (tag) return regionIndexFromId(tag);
  return regionIndexFromText(`${thread.title} ${thread.description ?? ''}`);
}
