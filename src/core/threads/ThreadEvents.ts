/**
 * ORIENT - Thread Events
 * 
 * Ruhige Ereignisse - semantische Marker.
 * Noch kein Event-Bus, nur Typen.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 * - Keine Push-Notifications
 */

export type ThreadEvent =
  | { type: 'THREAD_CREATED'; threadId: string }
  | { type: 'THREAD_ACTIVATED'; threadId: string }
  | { type: 'THREAD_OBSERVED'; threadId: string }
  | { type: 'THREAD_DORMANT'; threadId: string }
  | { type: 'THREAD_CLOSED'; threadId: string }
  | { type: 'THREAD_REACTIVATED'; threadId: string };
