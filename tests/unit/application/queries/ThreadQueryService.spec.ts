/**
 * ORIENT - Thread Query Service Tests
 * 
 * Tests für Thread-Query-Service.
 * Respektiert ORIENT_DNA: Ruhe, Transparenz.
 */

import { describe, it, expect } from 'vitest';
import { ThreadQueryService } from '@app/queries/ThreadQueryService';
import { ContextMode } from '@core/escalation/ContextMode';
import { ThreadStatus } from '@core/threads/ThreadStatus';

describe('ThreadQueryService', () => {
  it('creates a ThreadSnapshot (minimal)', async () => {
    const threadRepo: any = {
      getById: async () => ({
        id: 't1',
        title: 'Feiern & Gestaltung',
        status: ThreadStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { userRelevanceScore: 0.7 },
      }),
    };

    const impulseRepo: any = {
      findByThread: async () => ([
        { 
          id: 'i1', 
          createdAt: new Date(), 
          content: { text: 'Wunderkerzen-Servietten' },
          state: 'DUST',
          links: { threadIds: [], entityIds: [] },
          meta: { pinned: false },
        },
      ]),
    };

    const edgeRepo: any = {
      getAll: async () => ([]),
    };

    const svc = new ThreadQueryService({ threadRepo, impulseRepo, edgeRepo });

    const snap = await svc.getThreadSnapshot('t1', {
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(snap?.threadId).toBe('t1');
    expect(snap?.title).toBe('Feiern & Gestaltung');
    expect(snap?.summary.length).toBeGreaterThan(0);
    expect(snap?.highlights.length).toBeLessThanOrEqual(3);
    expect(snap?.uncertainties.length).toBeLessThanOrEqual(2);
  });

  it('handles DORMANT threads', async () => {
    const threadRepo: any = {
      getById: async () => ({
        id: 't2',
        title: 'Dormant Thread',
        status: ThreadStatus.DORMANT,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { userRelevanceScore: 0.5 },
      }),
    };

    const impulseRepo: any = {
      findByThread: async () => ([]),
    };

    const edgeRepo: any = {
      getAll: async () => ([]),
    };

    const svc = new ThreadQueryService({ threadRepo, impulseRepo, edgeRepo });

    const snap = await svc.getThreadSnapshot('t2', {
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(snap?.status).toBe(ThreadStatus.DORMANT);
    expect(snap?.summary).toContain('ruht gerade');
  });

  it('returns null for non-existent thread', async () => {
    const threadRepo: any = {
      getById: async () => null,
    };

    const impulseRepo: any = {
      findByThread: async () => ([]),
    };

    const edgeRepo: any = {
      getAll: async () => ([]),
    };

    const svc = new ThreadQueryService({ threadRepo, impulseRepo, edgeRepo });

    const snap = await svc.getThreadSnapshot('nonexistent', {
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(snap).toBeNull();
  });
});
