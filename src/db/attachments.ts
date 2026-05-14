/**
 * ORIENT - Attachment API
 * 
 * Voice → Context Attachment.
 * Eine Voice-Note an das aktuell fokussierte Panel hängen.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Attachments sichtbar)
 * - Local-first (nur lokale Daten)
 */

import { orientDb } from './orientDb';
import { logEvent } from './events';
import { linkVoiceToPanel } from './graph';

export async function getFocusedTargetId(): Promise<string | null> {
  const focusRow = await orientDb.kv.get('ui.focus');
  const openId = (focusRow?.value as any)?.openId;
  return openId ? String(openId) : null;
}

export async function getLastVoiceId(): Promise<number | null> {
  const last = await orientDb.voice.orderBy('createdAt').reverse().first();
  return last?.id ?? null;
}

export async function attachVoiceToTarget(targetId: string, voiceId: number) {
  // prevent duplicate attachment (same voiceId to same target)
  const all = await orientDb.attachments
    .where('kind')
    .equals('voice')
    .filter((a) => a.targetId === targetId && a.voiceId === voiceId)
    .toArray();

  const existing = all[0];
  if (existing) return existing.id ?? null;

  const id = await orientDb.attachments.add({
    createdAt: Date.now(),
    kind: 'voice',
    targetId,
    voiceId,
  });

  await logEvent('context.attach.voice', { targetId, voiceId });

  // Bridge: Attachments → Graph
  await linkVoiceToPanel(voiceId, targetId);

  return id;
}

export async function attachLastVoiceToFocus() {
  const targetId = await getFocusedTargetId();
  if (!targetId) return { ok: false as const, reason: 'no_focus' as const };

  const voiceId = await getLastVoiceId();
  if (!voiceId) return { ok: false as const, reason: 'no_voice' as const };

  await attachVoiceToTarget(targetId, voiceId);
  return { ok: true as const, targetId, voiceId };
}

export async function getVoiceAttachmentsForTarget(targetId: string) {
  return orientDb.attachments
    .where('kind')
    .equals('voice')
    .filter((a) => a.targetId === targetId)
    .sortBy('createdAt');
}

export async function detachAttachment(id: number) {
  const row = await orientDb.attachments.get(id);
  if (!row) return;
  await orientDb.attachments.delete(id);
  await logEvent('context.detach.voice', {
    targetId: row.targetId,
    voiceId: row.voiceId,
    id,
  });
}
