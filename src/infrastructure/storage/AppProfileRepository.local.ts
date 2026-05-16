/**
 * App-Profil & Präsenz — SQLite domain_kv
 */

import type { AppProfileSnapshot } from '../../store/types';
import { LocalDatabase } from './LocalDatabase';

const STORE = 'appProfile';
const KEY = 'main';

export class AppProfileRepositoryLocal {
  constructor(private readonly db: LocalDatabase) {}

  async load(): Promise<AppProfileSnapshot | null> {
    return this.db.get<AppProfileSnapshot>(STORE, KEY);
  }

  async save(snapshot: AppProfileSnapshot): Promise<void> {
    await this.db.put(STORE, KEY, snapshot);
  }
}
