/**
 * ORIENT - Repository Interface
 * 
 * Gemeinsame Basis für alle Repositories.
 * Ermöglicht Austauschbarkeit (IndexedDB → SQLite → Sync später).
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Transparenz statt Blackbox
 * - Keine Businesslogik im Storage
 */

export interface Repository<T, ID = string> {
  /**
   * Speichert eine Entity
   */
  save(entity: T): Promise<void>;

  /**
   * Findet Entity nach ID
   */
  getById(id: ID): Promise<T | null>;

  /**
   * Findet alle Entities
   */
  getAll(): Promise<T[]>;

  /**
   * Löscht Entity (optional, selten)
   * DNA: Keine automatische Löschung
   */
  delete?(id: ID): Promise<void>;
}
