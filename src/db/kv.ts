/**
 * ORIENT - KV Store Helper
 * 
 * Einfache Key-Value-Persistenz für UI-State.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Transparenz
 */

import { orientDb } from './orientDb';

export async function kvSet<T>(key: string, value: T): Promise<void> {
  await orientDb.kv.put({ key, value, updatedAt: Date.now() });
}

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const row = await orientDb.kv.get(key);
  return (row?.value as T) ?? fallback;
}
