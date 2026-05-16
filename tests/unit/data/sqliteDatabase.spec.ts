/**
 * ORIENT — SQLite (sql.js) CRUD via LocalDatabase + Repositories
 */

import { describe, it, expect, afterEach } from 'vitest';
import { OrientDatabase } from '@data/database';
import { ThreadRepositoryLocal } from '@infrastructure/storage/ThreadRepository.local';
import { ImpulseRepositoryLocal } from '@infrastructure/storage/ImpulseRepository.local';
import { EdgeRepositoryLocal } from '@infrastructure/storage/EdgeRepository.local';
import { UserContextRepositoryLocal } from '@infrastructure/storage/UserContextRepository.local';
import { ThreadStatus } from '@core/threads/ThreadStatus';
import { ImpulseState } from '@core/impulses/ImpulseState';
import { RelationType } from '@core/graph/RelationType';
import { ContextMode } from '@core/escalation/ContextMode';
import { getMeta } from '@data/schema';

describe('SQLite domain_kv (sql.js)', () => {
  let orient: OrientDatabase | null = null;

  afterEach(() => {
    orient?.close();
    orient = null;
  });

  it('applies schema v1 and default user', async () => {
    orient = await OrientDatabase.openInMemory();
    expect(getMeta(orient.raw, 'schema_version')).toBe('1');
    const users = orient.raw.exec('SELECT id FROM users');
    expect(users[0]?.values[0]?.[0]).toBe('local-user');
  });

  it('persists threads, impulses, edges with Date roundtrip', async () => {
    orient = await OrientDatabase.openInMemory();
    const db = orient.local;

    const threadRepo = new ThreadRepositoryLocal(db);
    const impulseRepo = new ImpulseRepositoryLocal(db);
    const edgeRepo = new EdgeRepositoryLocal(db);

    const created = new Date('2024-06-01T10:00:00Z');
    await threadRepo.save({
      id: 't-sql',
      title: 'SQLite Thread',
      status: ThreadStatus.ACTIVE,
      createdAt: created,
      updatedAt: created,
      metrics: {
        recencyScore: 0.5,
        frequencyScore: 0.5,
        confidenceScore: 0.5,
        userRelevanceScore: 0.5,
      },
    });

    await impulseRepo.save({
      id: 'i-sql',
      content: { text: 'Gedanke' },
      state: ImpulseState.DUST,
      createdAt: created,
      links: { threadIds: ['t-sql'], entityIds: [] },
      meta: { pinned: false },
    });

    await edgeRepo.save({
      id: 'e-sql',
      from: { type: 'IMPULSE', id: 'i-sql' },
      to: { type: 'THREAD', id: 't-sql' },
      relation: RelationType.RELATED_TO,
      weights: {
        confidence: 0.5,
        recency: 0.5,
        frequency: 0.5,
        userRelevance: 0.5,
      },
      createdAt: created,
      lastSeenAt: created,
    });

    const thread = await threadRepo.getById('t-sql');
    expect(thread?.title).toBe('SQLite Thread');
    expect(thread?.createdAt).toEqual(created);

    expect((await impulseRepo.getAll()).length).toBe(1);
    expect((await edgeRepo.getAll()).length).toBe(1);
    expect((await impulseRepo.findByThread('t-sql')).length).toBe(1);
  });

  it('stores user context singleton', async () => {
    orient = await OrientDatabase.openInMemory();
    const repo = new UserContextRepositoryLocal(orient.local);
    const ctx = await repo.getCurrent();
    expect(ctx.mode).toBe(ContextMode.NORMAL);
    await repo.save({ ...ctx, mode: ContextMode.QUIET });
    const again = await repo.getCurrent();
    expect(again.mode).toBe(ContextMode.QUIET);
  });

  it('deletes kv entries', async () => {
    orient = await OrientDatabase.openInMemory();
    await orient.local.put('threads', 'gone', { id: 'gone' });
    await orient.local.delete('threads', 'gone');
    expect(await orient.local.get('threads', 'gone')).toBeNull();
  });
});
