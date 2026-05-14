/**
 * ORIENT - Command Result
 * 
 * Alle Commands geben ruhige Rückmeldung, kein Erfolgsgeschrei.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 */

export interface CommandResult {
  ok: boolean;
  message?: string;        // ruhig, menschlich
  affectedIds?: string[];  // Threads / Impulses
}
