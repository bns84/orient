/**
 * ORIENT - Topic API
 * 
 * CRUD für Topics (lokal, ohne Chat/Historie).
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (keine Cloud-Pflicht)
 * - Ruhe vor Geschwindigkeit (kein Feed, keine Historie)
 * - Transparenz (Event-Logging)
 */

import { orientDb, TopicRow } from './orientDb';
import { logEvent } from './events';

function makeKey() {
  return 't_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
}

function titleFromPrompt(p: string) {
  const t = p.trim();
  if (!t) return 'Neues Thema';
  // very light cleanup
  return t.length > 64 ? t.slice(0, 63) + '…' : t;
}

export async function createTopicFromPrompt(
  prompt: string,
  origin: TopicRow['origin'] = 'manual'
) {
  const now = Date.now();
  const key = makeKey();
  const title = titleFromPrompt(prompt);

  const row: TopicRow = {
    key,
    title,
    summary: undefined,
    createdAt: now,
    updatedAt: now,
    origin,
    isNew: true,
  };

  await orientDb.topics.put(row);
  await logEvent('topic.created', { key, origin });
  return row;
}

export async function listTopics(limit = 40) {
  return orientDb.topics.orderBy('updatedAt').reverse().limit(limit).toArray();
}

export async function markTopicSeen(key: string) {
  await orientDb.topics.update(key, { isNew: false, updatedAt: Date.now() });
  await logEvent('topic.seen', { key });
}
