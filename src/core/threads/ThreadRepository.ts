/**
 * ORIENT - Thread Repository Interface
 * 
 * Abstraktion für Thread-Persistenz.
 * Kein SQLite hier, nur Vertrag.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Keine automatische Löschung
 * - Transparenz statt Blackbox
 */

import { Thread } from './Thread';

export interface ThreadRepository {
  /**
   * Findet Thread nach ID
   */
  getById(id: string): Promise<Thread | null>;

  /**
   * Speichert neuen Thread
   */
  save(thread: Thread): Promise<void>;

  /**
   * Aktualisiert bestehenden Thread
   */
  update(thread: Thread): Promise<void>;

  /**
   * Findet alle Threads (optional, für später)
   */
  findAll?(): Promise<Thread[]>;

  /**
   * Findet Threads nach Status (optional, für später)
   */
  findByStatus?(status: Thread['status']): Promise<Thread[]>;
}
