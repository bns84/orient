/**
 * ORIENT — SQLite Schema v1 (sql.js)
 * Subset von ORIENT_DATABASE_SCHEMA.md; domain_kv bridgt Domain-Repos bis Normalisierung.
 */

import type { Database } from 'sql.js';

export const SCHEMA_VERSION = '1';

export function getMeta(db: Database, key: string): string | null {
  const stmt = db.prepare('SELECT value FROM meta WHERE key = ?');
  stmt.bind([key]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as { value: string };
  stmt.free();
  return row.value;
}

export function setMeta(db: Database, key: string, value: string): void {
  db.run(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export function applySchemaMigrations(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  if (getMeta(db, 'schema_version') === SCHEMA_VERSION) {
    return;
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS domain_kv (
      store TEXT NOT NULL,
      key TEXT NOT NULL,
      value_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (store, key)
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_domain_kv_store ON domain_kv(store);`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      settings_json TEXT,
      device_keys_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const now = Date.now();
  db.run(
    `INSERT OR IGNORE INTO users (id, settings_json, created_at, updated_at)
     VALUES (?, ?, ?, ?)`,
    ['local-user', '{}', now, now],
  );

  setMeta(db, 'schema_version', SCHEMA_VERSION);
}
