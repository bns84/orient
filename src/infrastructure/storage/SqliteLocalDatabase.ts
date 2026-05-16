/**
 * ORIENT — LocalDatabase über sql.js (domain_kv)
 */

import type { Database } from 'sql.js';
import { deserializeCoreValue, serializeCoreValue } from './corePersistence';
import { LocalDatabase } from './LocalDatabase';

export class SqliteLocalDatabase implements LocalDatabase {
  constructor(
    private readonly db: Database,
    private readonly onMutate: () => void,
  ) {}

  async put<T>(store: string, key: string, value: T): Promise<void> {
    const json = JSON.stringify(serializeCoreValue(value));
    this.db.run(
      `INSERT INTO domain_kv (store, key, value_json, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(store, key) DO UPDATE SET
         value_json = excluded.value_json,
         updated_at = excluded.updated_at`,
      [store, key, json, Date.now()],
    );
    this.onMutate();
  }

  async get<T>(store: string, key: string): Promise<T | null> {
    const stmt = this.db.prepare(
      'SELECT value_json FROM domain_kv WHERE store = ? AND key = ?',
    );
    stmt.bind([store, key]);
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject() as { value_json: string };
    stmt.free();
    return deserializeCoreValue<T>(JSON.parse(row.value_json));
  }

  async getAll<T>(store: string): Promise<T[]> {
    const stmt = this.db.prepare('SELECT value_json FROM domain_kv WHERE store = ?');
    stmt.bind([store]);
    const out: T[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as { value_json: string };
      out.push(deserializeCoreValue<T>(JSON.parse(row.value_json)));
    }
    stmt.free();
    return out;
  }

  async delete(store: string, key: string): Promise<void> {
    this.db.run('DELETE FROM domain_kv WHERE store = ? AND key = ?', [store, key]);
    this.onMutate();
  }
}
