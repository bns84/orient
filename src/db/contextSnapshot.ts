/**
 * ORIENT - Context Snapshot API
 * 
 * Persistiert Context-Snapshot in KV.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Transparenz
 */

import { kvGet, kvSet } from './kv';

export type ContextSnapshot = {
  // bewusst generisch – passt an euren echten Context an
  version: number;
  data: unknown;
  updatedAt: number;
};

const KEY = 'context.current';
const FALLBACK: ContextSnapshot = { version: 1, data: null, updatedAt: 0 };

export async function saveContextSnapshot(data: unknown) {
  const snap: ContextSnapshot = { version: 1, data, updatedAt: Date.now() };
  await kvSet(KEY, snap);
}

export async function loadContextSnapshot(): Promise<ContextSnapshot> {
  return kvGet(KEY, FALLBACK);
}
