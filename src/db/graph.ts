/**
 * ORIENT - Graph API
 * 
 * Minimales Graph-Modell: Nodes + Relations.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Nodes/Relations sichtbar)
 * - Local-first (nur lokale Daten)
 */

import { orientDb, NodeKind, RelationType } from './orientDb';
import { logEvent } from './events';

function now() {
  return Date.now();
}

export async function ensureNode(
  kind: NodeKind,
  key: string,
  label?: string,
  payload?: unknown,
) {
  const existing = await orientDb.nodes.where('key').equals(key).first();
  if (existing?.id) {
    // optional update label/payload
    await orientDb.nodes.update(existing.id, {
      label: label ?? existing.label,
      payload: payload ?? existing.payload,
      updatedAt: now(),
    });
    return existing.id;
  }

  const id = await orientDb.nodes.add({
    kind,
    key,
    label,
    payload,
    createdAt: now(),
    updatedAt: now(),
  });

  return id;
}

export async function ensurePanelNode(panelId: string) {
  return ensureNode('panel', `panel:${panelId}`, panelId);
}

export async function ensureVoiceNode(voiceId: number) {
  return ensureNode('voice', `voice:${voiceId}`, `Voice #${voiceId}`, { voiceId });
}

export async function ensureContextNode(key = 'current', payload?: unknown) {
  return ensureNode('context', `context:${key}`, `Context:${key}`, payload);
}

export async function ensureRelation(fromId: number, toId: number, type: RelationType) {
  const all = await orientDb.relations
    .where('fromId')
    .equals(fromId)
    .filter((r) => r.toId === toId && r.type === type)
    .toArray();
  const existing = all[0];
  if (existing?.id) return existing.id;

  return orientDb.relations.add({ fromId, toId, type, createdAt: now() });
}

export async function linkVoiceToPanel(voiceId: number, panelId: string) {
  const voiceNodeId = await ensureVoiceNode(voiceId);
  const panelNodeId = await ensurePanelNode(panelId);
  const relId = await ensureRelation(voiceNodeId, panelNodeId, 'ATTACHED_TO');

  await logEvent('graph.link.voice_to_panel', { voiceId, panelId, relId });
  return { voiceNodeId, panelNodeId, relId };
}

export async function getNodeByKey(key: string) {
  return orientDb.nodes.where('key').equals(key).first();
}

export async function getNeighbors(nodeId: number) {
  const outgoing = await orientDb.relations.where('fromId').equals(nodeId).toArray();
  const incoming = await orientDb.relations.where('toId').equals(nodeId).toArray();

  const outTargets = await Promise.all(
    outgoing.map((r) => orientDb.nodes.get(r.toId)).filter(Boolean),
  );
  const inSources = await Promise.all(
    incoming.map((r) => orientDb.nodes.get(r.fromId)).filter(Boolean),
  );

  return {
    outgoing: outgoing
      .map((r, i) => ({ rel: r, node: outTargets[i] }))
      .filter((x) => x.node),
    incoming: incoming
      .map((r, i) => ({ rel: r, node: inSources[i] }))
      .filter((x) => x.node),
  };
}
