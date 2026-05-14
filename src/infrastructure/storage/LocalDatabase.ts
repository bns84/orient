/**
 * ORIENT - Local Database Interface
 * 
 * Abstraktion für lokale Datenbank.
 * Kein konkretes Framework fest verdrahtet.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Austauschbarkeit (IndexedDB → SQLite → Sync später)
 * - Vorbereitet für Verschlüsselung
 * 
 * Wichtig:
 * Noch keine konkrete Implementierung (Dexie, idb, SQLite etc.).
 * Das ist absichtlich so - Cursor kann das später ersetzen oder erweitern.
 */

export interface LocalDatabase {
  /**
   * Speichert Wert in Store
   * @param store Store-Name
   * @param key Schlüssel
   * @param value Wert (später: kann verschlüsselt sein)
   */
  put<T>(store: string, key: string, value: T): Promise<void>;

  /**
   * Liest Wert aus Store
   * @param store Store-Name
   * @param key Schlüssel
   * @returns Wert oder null
   */
  get<T>(store: string, key: string): Promise<T | null>;

  /**
   * Liest alle Werte aus Store
   * @param store Store-Name
   * @returns Array aller Werte
   */
  getAll<T>(store: string): Promise<T[]>;

  /**
   * Löscht Wert aus Store
   * @param store Store-Name
   * @param key Schlüssel
   */
  delete(store: string, key: string): Promise<void>;
}
