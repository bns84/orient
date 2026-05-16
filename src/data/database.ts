/**
 * ORIENT — SQLite (sql.js) Primärspeicher für Domain-Daten
 */

import type { Database, SqlJsStatic } from 'sql.js';
import { loadSqlJs } from './sqlJsLoader';
import { applySchemaMigrations } from './schema';
import { loadSqliteBlob, saveSqliteBlob } from './idbPersist';
import { migrateDexieCoreStoreIfNeeded } from './migrateDexieCore';
import { SqliteLocalDatabase } from '../infrastructure/storage/SqliteLocalDatabase';
import type { LocalDatabase } from '../infrastructure/storage/LocalDatabase';

export class OrientDatabase {
  readonly local: SqliteLocalDatabase;

  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor(
    private readonly sql: SqlJsStatic,
    readonly raw: Database,
    onMutate: () => void,
  ) {
    this.local = new SqliteLocalDatabase(raw, onMutate);
  }

  static async open(): Promise<OrientDatabase> {
    const SQL = await loadSqlJs();
    const blob = await loadSqliteBlob();
    const raw = blob ? new SQL.Database(blob) : new SQL.Database();
    applySchemaMigrations(raw);

    let instance!: OrientDatabase;
    instance = new OrientDatabase(SQL, raw, () => instance.schedulePersist());

    await migrateDexieCoreStoreIfNeeded(raw);
    await instance.persist();
    return instance;
  }

  /** In-Memory für Tests (kein IndexedDB-Export) */
  static async openInMemory(): Promise<OrientDatabase> {
    const SQL = await loadSqlJs();
    const raw = new SQL.Database();
    applySchemaMigrations(raw);
    let instance!: OrientDatabase;
    instance = new OrientDatabase(SQL, raw, () => {});
    return instance;
  }

  schedulePersist(): void {
    if (this.persistTimer !== null) {
      return;
    }
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.persist();
    }, 250);
  }

  async persist(): Promise<void> {
    await saveSqliteBlob(this.raw.export());
  }

  close(): void {
    this.raw.close();
  }
}

let openPromise: Promise<OrientDatabase> | null = null;

export async function getOrientDatabase(): Promise<OrientDatabase> {
  if (!openPromise) {
    openPromise = OrientDatabase.open().catch((err) => {
      openPromise = null;
      throw err;
    });
  }
  return openPromise;
}

export async function initOrientDataLayer(): Promise<{ db: LocalDatabase }> {
  const orient = await getOrientDatabase();
  return { db: orient.local };
}
