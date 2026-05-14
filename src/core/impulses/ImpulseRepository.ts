/**
 * ORIENT - Impulse Repository Interface
 * 
 * Abstraktion für Impulse-Persistenz.
 * Kein SQLite hier, nur Vertrag.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Keine automatische Löschung
 * - Impulse sind Momentaufnahmen
 */

import { Impulse } from './Impulse';

export interface ImpulseRepository {
  /**
   * Speichert neuen Impulse (Momentaufnahme)
   */
  save(impulse: Impulse): Promise<void>;

  /**
   * Findet Impulse nach ID
   */
  getById(id: string): Promise<Impulse | null>;

  /**
   * Findet alle Impulse eines Threads
   */
  findByThread(threadId: string): Promise<Impulse[]>;

  /**
   * Findet die neuesten Impulse (für UI/HUD/Export-Flows)
   */
  findRecent(limit: number): Promise<Impulse[]>;

  /**
   * Findet alle Impulse einer Entity (optional, für später)
   */
  findByEntity?(entityId: string): Promise<Impulse[]>;

  /**
   * Findet Impulse nach State (optional, für später)
   */
  findByState?(state: Impulse['state']): Promise<Impulse[]>;
}
