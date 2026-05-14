/**
 * ORIENT - Voice Retention / Cleanup
 * 
 * Policy: max N Items oder max Age.
 * Cleanup nach jedem voice.saved (non-blocking).
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (Cleanup lokal)
 * - Transparenz (Policy sichtbar)
 */

import { orientDb } from './orientDb';

type Policy = {
  maxItems?: number; // e.g. 50
  maxAgeDays?: number; // e.g. 14
};

export async function enforceVoiceRetention(policy: Policy) {
  const now = Date.now();

  if (policy.maxAgeDays != null) {
    const cutoff = now - policy.maxAgeDays * 24 * 60 * 60 * 1000;
    const old = await orientDb.voice.where('createdAt').below(cutoff).toArray();
    if (old.length) {
      const ids = old.map((r) => r.id!).filter(Boolean);
      await orientDb.voice.bulkDelete(ids);
    }
  }

  if (policy.maxItems != null) {
    const count = await orientDb.voice.count();
    if (count > policy.maxItems) {
      const toRemove = count - policy.maxItems;
      const oldest = await orientDb.voice.orderBy('createdAt').limit(toRemove).toArray();
      const ids = oldest.map((r) => r.id!).filter(Boolean);
      if (ids.length) await orientDb.voice.bulkDelete(ids);
    }
  }
}
