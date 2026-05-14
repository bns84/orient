/**
 * ORIENT - DB Export / Import
 * 
 * Debug-Tool für DB-Export/Import.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (Export lokal)
 * - Transparenz (alle Daten sichtbar)
 */

import { orientDb } from './orientDb';

export async function exportDB() {
  const [kv, events, voice] = await Promise.all([
    orientDb.kv.toArray(),
    orientDb.events.toArray(),
    orientDb.voice.toArray(),
  ]);

  return {
    kv,
    events,
    voice: voice.map((v) => ({
      ...v,
      blob: undefined, // meta only
    })),
  };
}

export async function importDB(data: any) {
  await orientDb.transaction('rw', orientDb.kv, orientDb.events, async () => {
    if (data.kv) {
      await orientDb.kv.bulkPut(data.kv);
    }
    if (data.events) {
      await orientDb.events.bulkPut(data.events);
    }
  });
  // Note: Voice blobs are not imported (would need separate blob handling)
}
