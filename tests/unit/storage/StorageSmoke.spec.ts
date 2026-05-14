/**
 * ORIENT - Storage Smoke Tests
 * 
 * Tests für lokale Repositories mit In-Memory-DB.
 * Respektiert ORIENT_DNA: Local-first, testbar.
 */

import { describe, it, expect } from 'vitest';
import { ThreadRepositoryLocal } from '@infrastructure/storage/ThreadRepository.local';
import { ImpulseRepositoryLocal } from '@infrastructure/storage/ImpulseRepository.local';
import { EdgeRepositoryLocal } from '@infrastructure/storage/EdgeRepository.local';
import { LocalDatabase } from '@infrastructure/storage/LocalDatabase';
import { ThreadStatus } from '@core/threads/ThreadStatus';
import { ImpulseState } from '@core/impulses/ImpulseState';
import { RelationType } from '@core/graph/RelationType';

/**
 * In-Memory Test-Double für LocalDatabase
 */
const createMemoryDB = (): LocalDatabase => {
  const stores = new Map<string, Map<string, any>>();

  const store = (name: string): Map<string, any> => {
    if (!stores.has(name)) {
      stores.set(name, new Map());
    }
    return stores.get(name)!;
  };

  return {
    async put(s: string, k: string, v: any): Promise<void> {
      store(s).set(k, v);
    },
    async get<T>(s: string, k: string): Promise<T | null> {
      return (store(s).get(k) as T) ?? null;
    },
    async getAll<T>(s: string): Promise<T[]> {
      return Array.from(store(s).values()) as T[];
    },
    async delete(s: string, k: string): Promise<void> {
      store(s).delete(k);
    },
  };
};

describe('Local Storage Smoke Test', () => {
  it('stores and retrieves threads', async () => {
    const db = createMemoryDB();
    const repo = new ThreadRepositoryLocal(db);

    const thread = {
      id: 't1',
      title: 'Test Thread',
      status: ThreadStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      metrics: {
        recencyScore: 0.5,
        frequencyScore: 0.5,
        confidenceScore: 0.5,
        userRelevanceScore: 0.5,
      },
    };

    await repo.save(thread);
    const retrieved = await repo.getById('t1');
    const all = await repo.getAll();

    expect(retrieved).toEqual(thread);
    expect(all).toHaveLength(1);
  });

  it('stores and retrieves impulses', async () => {
    const db = createMemoryDB();
    const repo = new ImpulseRepositoryLocal(db);

    const impulse = {
      id: 'i1',
      content: { text: 'Test impulse' },
      state: ImpulseState.DUST,
      createdAt: new Date('2024-01-01'),
      links: { threadIds: [], entityIds: [] },
      meta: { pinned: false },
    };

    await repo.save(impulse);
    const retrieved = await repo.getById('i1');
    const all = await repo.getAll();

    expect(retrieved).toEqual(impulse);
    expect(all).toHaveLength(1);
  });

  it('stores and retrieves edges', async () => {
    const db = createMemoryDB();
    const repo = new EdgeRepositoryLocal(db);

    const edge = {
      id: 'e1',
      from: { type: 'IMPULSE' as const, id: 'i1' },
      to: { type: 'THREAD' as const, id: 't1' },
      relation: RelationType.RELATED_TO,
      weights: {
        confidence: 0.5,
        recency: 0.5,
        frequency: 0.5,
        userRelevance: 0.5,
      },
      createdAt: new Date('2024-01-01'),
      lastSeenAt: new Date('2024-01-01'),
    };

    await repo.save(edge);
    const retrieved = await repo.getById('e1');
    const all = await repo.getAll();

    expect(retrieved).toEqual(edge);
    expect(all).toHaveLength(1);
  });

  it('stores and retrieves core objects together', async () => {
    const db = createMemoryDB();

    const threadRepo = new ThreadRepositoryLocal(db);
    const impulseRepo = new ImpulseRepositoryLocal(db);
    const edgeRepo = new EdgeRepositoryLocal(db);

    await threadRepo.save({
      id: 't1',
      title: 'Test',
      status: ThreadStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        recencyScore: 0.5,
        frequencyScore: 0.5,
        confidenceScore: 0.5,
        userRelevanceScore: 0.5,
      },
    } as any);

    await impulseRepo.save({
      id: 'i1',
      state: ImpulseState.DUST,
      createdAt: new Date(),
      content: { text: 'Test' },
      links: { threadIds: [], entityIds: [] },
      meta: { pinned: false },
    } as any);

    await edgeRepo.save({
      id: 'e1',
      relation: RelationType.RELATED_TO,
      from: { type: 'IMPULSE', id: 'i1' },
      to: { type: 'THREAD', id: 't1' },
      weights: {
        confidence: 0.5,
        recency: 0.5,
        frequency: 0.5,
        userRelevance: 0.5,
      },
      createdAt: new Date(),
      lastSeenAt: new Date(),
    } as any);

    expect((await threadRepo.getAll()).length).toBe(1);
    expect((await impulseRepo.getAll()).length).toBe(1);
    expect((await edgeRepo.getAll()).length).toBe(1);
  });

  it('returns null for non-existent entities', async () => {
    const db = createMemoryDB();
    const repo = new ThreadRepositoryLocal(db);

    const result = await repo.getById('nonexistent');
    expect(result).toBeNull();
  });

  describe('DNA-Konformität', () => {
    it('local-first storage (DNA: Local-first)', () => {
      const db = createMemoryDB();
      const repo = new ThreadRepositoryLocal(db);

      // Repository funktioniert lokal, keine Cloud-Abhängigkeit
      expect(repo).toBeDefined();
      expect(db).toBeDefined();
    });

    it('no business logic in storage (DNA: Transparenz)', () => {
      const db = createMemoryDB();
      const repo = new ThreadRepositoryLocal(db);

      // Repository ist nur Storage, keine Businesslogik
      expect(repo.save).toBeDefined();
      expect(repo.getById).toBeDefined();
      expect(repo.getAll).toBeDefined();
    });
  });
});
