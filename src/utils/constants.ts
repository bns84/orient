/**
 * ORIENT - Constants
 * 
 * Alle Konstanten respektieren die ORIENT_DNA.
 */

// DNA-Principles (für Code-Referenz)
export const DNA_PRINCIPLES = {
  QUIET_BEFORE_SPEED: 'Ruhe vor Geschwindigkeit',
  MEANING_BEFORE_VOLUME: 'Bedeutung vor Lautstärke',
  CONTEXT_BEFORE_INFO: 'Zusammenhang vor Einzelinformation',
  LONGTERM_BEFORE_SHORTTERM: 'Langfristigkeit vor kurzfristigem Nutzen',
  TRANSPARENCY_INSTEAD_BLACKBOX: 'Transparenz statt Blackbox',
  RESPONSIBILITY_ALWAYS_HUMAN: 'Verantwortung bleibt immer beim Menschen',
  SILENCE_IS_FEATURE: 'Stille ist ein Feature',
} as const;

// Unveränderliche Regeln
export const IMMUTABLE_RULES = {
  NO_MANIPULATION: 'ORIENT manipuliert nicht',
  NO_MORALIZING: 'ORIENT moralisiert nicht',
  NO_GAMIFICATION: 'ORIENT gamifiziert nicht',
  NO_ENGAGEMENT_OPTIMIZATION: 'ORIENT optimiert nicht auf Engagement',
  NO_PRESSURE: 'ORIENT erzeugt keinen Druck',
  NO_AUTO_DELETE: 'ORIENT löscht keine Gedanken automatisch',
} as const;

// Eskalation Limits
export const ESCALATION_MAX_LEVEL = 3; // Stufe 4 technisch gesperrt

// Thread Lifecycle
export const THREAD_STATUS_TRANSITIONS = {
  ACTIVE: ['OBSERVED', 'CLOSED'],
  OBSERVED: ['DORMANT', 'ACTIVE', 'CLOSED'],
  DORMANT: ['ACTIVE'], // Nur explizite Reaktivierung
  CLOSED: [], // Endzustand (kann später reaktiviert werden)
} as const;

// Database
export const DB_NAME = 'orient.db';
export const DB_VERSION = 1;

// Encryption
export const ENCRYPTED_FIELDS = [
  'impulses.content_text',
  'impulses.content_payload',
  'context_snapshots.fields',
] as const;
