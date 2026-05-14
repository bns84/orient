/**
 * ORIENT - Events Helper
 * 
 * Event-Logging für Interaktionen.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Events sichtbar)
 * - Local-first (nur lokale Events)
 */

import { orientDb } from './orientDb';
import { ingestBehaviorEvent } from '../behavior/sensors';

export async function logEvent(type: string, payload?: unknown) {
  ingestBehaviorEvent(type, payload); // <- NEW: behavior ingest (sync, no promises)
  await orientDb.events.add({
    type,
    payload,
    createdAt: Date.now(),
  });
}

export async function getLastEvents(limit = 30) {
  return orientDb.events.orderBy('createdAt').reverse().limit(limit).toArray();
}
