/**
 * ORIENT - Memory Local Database
 * 
 * In-Memory-Implementierung für schnelles UI-Testing.
 * Später ersetzt durch IndexedDB/SQLite.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (auch im Memory)
 * - Austauschbarkeit (gleiche Interface)
 */

import { LocalDatabase } from './LocalDatabase';

export class MemoryLocalDatabase implements LocalDatabase {
  private stores = new Map<string, Map<string, any>>();

  private store(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new Map());
    return this.stores.get(name)!;
  }

  async put<T>(store: string, key: string, value: T): Promise<void> {
    this.store(store).set(key, value);
  }

  async get<T>(store: string, key: string): Promise<T | null> {
    return this.store(store).get(key) ?? null;
  }

  async getAll<T>(store: string): Promise<T[]> {
    return Array.from(this.store(store).values());
  }

  async delete(store: string, key: string): Promise<void> {
    this.store(store).delete(key);
  }
}
