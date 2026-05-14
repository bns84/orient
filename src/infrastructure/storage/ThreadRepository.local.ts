/**
 * ORIENT - Thread Repository (Local)
 * 
 * Lokale Implementierung des Thread-Repositories.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Keine Businesslogik im Storage
 * - Vorbereitet für Verschlüsselung
 */

import { Repository } from '@core/storage/Repository';
import { Thread } from '@core/threads/Thread';
import { ThreadRepository } from '@core/threads/ThreadRepository';
import { LocalDatabase } from './LocalDatabase';

const STORE = 'threads';

export class ThreadRepositoryLocal implements ThreadRepository {
  constructor(private db: LocalDatabase) {}

  async save(thread: Thread): Promise<void> {
    await this.db.put(STORE, thread.id, thread);
  }

  async getById(id: string): Promise<Thread | null> {
    return this.db.get<Thread>(STORE, id);
  }

  async getAll(): Promise<Thread[]> {
    return this.db.getAll<Thread>(STORE);
  }

  async update(thread: Thread): Promise<void> {
    await this.db.put(STORE, thread.id, thread);
  }

  async findAll(): Promise<Thread[]> {
    return this.db.getAll<Thread>(STORE);
  }
}
