/**
 * ORIENT - Impulse Repository (Local)
 *
 * Speichert content.text / content.transcript verschlüsselt at rest.
 */

import { ImpulseRepository } from '@core/impulses/ImpulseRepository';
import { Impulse } from '@core/impulses/Impulse';
import { LocalDatabase } from './LocalDatabase';
import {
  sealImpulseContent,
  unsealImpulseContent,
  type StoredImpulseContent,
} from '../../services/impulseContentCrypto';

const STORE = 'impulses';

type StoredImpulse = Omit<Impulse, 'content'> & { content: StoredImpulseContent };

export class ImpulseRepositoryLocal implements ImpulseRepository {
  constructor(private db: LocalDatabase) {}

  private async toStored(impulse: Impulse): Promise<StoredImpulse> {
    return {
      ...impulse,
      content: await sealImpulseContent(impulse.content),
    };
  }

  private async fromStored(stored: StoredImpulse): Promise<Impulse> {
    return {
      ...stored,
      content: await unsealImpulseContent(stored.content),
    };
  }

  async save(impulse: Impulse): Promise<void> {
    await this.db.put(STORE, impulse.id, await this.toStored(impulse));
  }

  async getById(id: string): Promise<Impulse | null> {
    const row = await this.db.get<StoredImpulse>(STORE, id);
    if (!row) return null;
    return this.fromStored(row);
  }

  async getAll(): Promise<Impulse[]> {
    const rows = await this.db.getAll<StoredImpulse>(STORE);
    return Promise.all(rows.map((r) => this.fromStored(r)));
  }

  async findByThread(threadId: string): Promise<Impulse[]> {
    const all = await this.getAll();
    return all.filter((impulse) => impulse.links.threadIds.includes(threadId));
  }

  async findRecent(limit: number): Promise<Impulse[]> {
    const all = await this.getAll();
    return all
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limit);
  }
}
