/**
 * ORIENT — LocalDatabase über Dexie (IndexedDB, überlebt Reload)
 */

import { orientDb } from '../../db/orientDb';
import { LocalDatabase } from './LocalDatabase';
import { deserializeCoreValue, serializeCoreValue } from './corePersistence';

function compoundKey(store: string, key: string): string {
  return `${store}::${key}`;
}

export class DexieLocalDatabase implements LocalDatabase {
  async put<T>(store: string, key: string, value: T): Promise<void> {
    await orientDb.coreStore.put({
      id: compoundKey(store, key),
      store,
      key,
      value: serializeCoreValue(value),
      updatedAt: Date.now(),
    });
  }

  async get<T>(store: string, key: string): Promise<T | null> {
    const row = await orientDb.coreStore.get(compoundKey(store, key));
    if (!row) return null;
    return deserializeCoreValue<T>(row.value);
  }

  async getAll<T>(store: string): Promise<T[]> {
    const rows = await orientDb.coreStore.where('store').equals(store).toArray();
    return rows.map((r) => deserializeCoreValue<T>(r.value));
  }

  async delete(store: string, key: string): Promise<void> {
    await orientDb.coreStore.delete(compoundKey(store, key));
  }
}
