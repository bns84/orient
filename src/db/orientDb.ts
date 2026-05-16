/**
 * ORIENT - IndexedDB via Dexie
 * 
 * Persistenz für UI-State, Events, Voice.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Transparenz (versioniertes Schema)
 */

import Dexie, { Table } from 'dexie';

export type KvRow = {
  key: string;
  value: unknown;
  updatedAt: number;
};

export type EventRow = {
  id?: number;
  type: string;
  payload?: unknown;
  createdAt: number;
};

export type VoiceRow = {
  id?: number;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  blob: Blob;
  note?: string;
  status?: 'recorded' | 'pending' | 'done';
  transcript?: string;
};

export type AttachmentRow = {
  id?: number;
  createdAt: number;

  kind: 'voice';
  targetId: string; // z.B. "context-panel" oder "overview-panel"
  voiceId: number;
};

export type NodeKind = 'panel' | 'voice' | 'context';

export type NodeRow = {
  id?: number;
  kind: NodeKind;

  // ein stabiler Key pro Node (damit ensure funktioniert)
  key: string; // e.g. "panel:context-panel" | "voice:123" | "context:current"
  label?: string;

  payload?: unknown;
  createdAt: number;
  updatedAt: number;
};

export type RelationType = 'ATTACHED_TO' | 'REFERS_TO' | 'FOLLOWS';

export type RelationRow = {
  id?: number;
  fromId: number;
  toId: number;
  type: RelationType;
  createdAt: number;
};

export type InterestRow = {
  key: string; // topicKey
  weight: number; // soft, e.g. 0..100
  lastBumpAt: number;
};

export type TopicRow = {
  key: string; // uuid-ish
  title: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  origin: 'voice' | 'manual' | 'system';
  isNew?: boolean;
};

/** Domain-Persistenz: Threads, Impulses, Edges, UserContext */
export type CoreStoreRow = {
  id: string;
  store: string;
  key: string;
  value: unknown;
  updatedAt: number;
};

class OrientDB extends Dexie {
  kv!: Table<KvRow, string>;
  events!: Table<EventRow, number>;
  voice!: Table<VoiceRow, number>;
  attachments!: Table<AttachmentRow, number>;
  nodes!: Table<NodeRow, number>;
  relations!: Table<RelationRow, number>;
  interest!: Table<InterestRow, string>;
  topics!: Table<TopicRow, string>;
  coreStore!: Table<CoreStoreRow, string>;

  constructor() {
    super('orient_db');

    this.version(1).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
    });

    this.version(2).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
      attachments: '++id, kind, targetId, voiceId, createdAt',
    });

    this.version(3).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
      attachments: '++id, kind, targetId, voiceId, createdAt',
      nodes: '++id, kind, key, updatedAt',
      relations: '++id, fromId, toId, type, createdAt',
    });

    this.version(4).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
      attachments: '++id, kind, targetId, voiceId, createdAt',
      nodes: '++id, kind, key, updatedAt',
      relations: '++id, fromId, toId, type, createdAt',
      interest: 'key, weight, lastBumpAt',
    });

    this.version(5).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
      attachments: '++id, kind, targetId, voiceId, createdAt',
      nodes: '++id, kind, key, updatedAt',
      relations: '++id, fromId, toId, type, createdAt',
      interest: 'key, weight, lastBumpAt',
      topics: 'key, updatedAt, origin, createdAt',
    });

    this.version(6).stores({
      kv: 'key, updatedAt',
      events: '++id, type, createdAt',
      voice: '++id, createdAt',
      attachments: '++id, kind, targetId, voiceId, createdAt',
      nodes: '++id, kind, key, updatedAt',
      relations: '++id, fromId, toId, type, createdAt',
      interest: 'key, weight, lastBumpAt',
      topics: 'key, updatedAt, origin, createdAt',
      coreStore: 'id, store, key, updatedAt',
    });
  }
}

export const orientDb = new OrientDB();
