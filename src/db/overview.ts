/**
 * ORIENT - Overview Selector
 * 
 * Counts + Last timestamps für Overview-Panel.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Daten sichtbar)
 * - Local-first (nur lokale Daten)
 */

import { orientDb } from './orientDb';

export type OrientOverview = {
  now: number;

  kvCount: number;
  lastKvUpdateAt: number | null;

  eventsCount: number;
  lastEventAt: number | null;

  voiceCount: number;
  lastVoiceAt: number | null;

  focusOpenId: string | null;
  contextSnapshotAt: number | null;
};

export async function getOrientOverview(): Promise<OrientOverview> {
  const now = Date.now();

  const [kvCount, eventsCount, voiceCount] = await Promise.all([
    orientDb.kv.count(),
    orientDb.events.count(),
    orientDb.voice.count(),
  ]);

  const [lastKv, lastEvent, lastVoice] = await Promise.all([
    orientDb.kv.orderBy('updatedAt').reverse().first(),
    orientDb.events.orderBy('createdAt').reverse().first(),
    orientDb.voice.orderBy('createdAt').reverse().first(),
  ]);

  // focus state (aus KV, so wie in Focusable persistKey)
  const focusRow = await orientDb.kv.get('ui.focus');
  const focusOpenId =
    (focusRow?.value as any)?.openId != null
      ? String((focusRow?.value as any).openId)
      : null;

  // context snapshot (falls vorhanden)
  const contextRow = await orientDb.kv.get('context.current');
  const contextSnapshotAt =
    (contextRow?.value as any)?.updatedAt != null
      ? Number((contextRow?.value as any).updatedAt)
      : null;

  return {
    now,
    kvCount,
    lastKvUpdateAt: lastKv?.updatedAt ?? null,

    eventsCount,
    lastEventAt: lastEvent?.createdAt ?? null,

    voiceCount,
    lastVoiceAt: lastVoice?.createdAt ?? null,

    focusOpenId,
    contextSnapshotAt,
  };
}
