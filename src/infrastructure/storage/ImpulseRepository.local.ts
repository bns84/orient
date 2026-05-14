/**
 * ORIENT - Impulse Repository (Local)
 * 
 * Lokale Implementierung des Impulse-Repositories.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Keine Businesslogik im Storage
 * - Vorbereitet für Verschlüsselung
 */

import { ImpulseRepository } from '@core/impulses/ImpulseRepository';
import { Impulse } from '@core/impulses/Impulse';
import { LocalDatabase } from './LocalDatabase';

const STORE = 'impulses';

export class ImpulseRepositoryLocal implements ImpulseRepository {
  constructor(private db: LocalDatabase) {}

  async save(impulse: Impulse): Promise<void> {
    await this.db.put(STORE, impulse.id, impulse);
  }

  async getById(id: string): Promise<Impulse | null> {
    return this.db.get<Impulse>(STORE, id);
  }

  async getAll(): Promise<Impulse[]> {
    return this.db.getAll<Impulse>(STORE);
  }

  async findByThread(threadId: string): Promise<Impulse[]> {
    const all = await this.db.getAll<Impulse>(STORE);
    return all.filter((impulse) => impulse.links.threadIds.includes(threadId));
  }

  async findRecent(limit: number): Promise<Impulse[]> {
    const all = await this.db.getAll<Impulse>(STORE);
    return all
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limit);
  }
}
