/**
 * Einmalige Migration: Dexie coreStore → SQLite domain_kv
 */

import type { Database } from 'sql.js';
import { orientDb } from '../db/orientDb';
import { getMeta, setMeta } from './schema';

const MIGRATION_KEY = 'migration.dexie_core_v6';

export async function migrateDexieCoreStoreIfNeeded(raw: Database): Promise<void> {
  if (getMeta(raw, MIGRATION_KEY) === 'done') {
    return;
  }

  try {
    await orientDb.open();
    const rows = await orientDb.coreStore.toArray();
    for (const row of rows) {
      const json =
        typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
      raw.run(
        `INSERT INTO domain_kv (store, key, value_json, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(store, key) DO UPDATE SET
           value_json = excluded.value_json,
           updated_at = excluded.updated_at`,
        [row.store, row.key, json, row.updatedAt],
      );
    }
  } catch (err) {
    console.warn('[ORIENT] Dexie coreStore migration skipped:', err);
  }

  setMeta(raw, MIGRATION_KEY, 'done');
}
