import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ThreadStatus } from '../../../src/core/threads/ThreadStatus';
import { useImpulsesStore } from '../../../src/store/useImpulsesStore';
import { useThreadsStore } from '../../../src/store/useThreadsStore';

describe('threads & impulses stores', () => {
  beforeEach(() => {
    useThreadsStore.setState({ threads: [], activeThreadId: null, loading: false });
    useImpulsesStore.setState({ recent: [], loading: false });
  });

  it('loads threads from repository', async () => {
    const threads = [
      {
        id: 't1',
        title: 'Test',
        status: ThreadStatus.ACTIVE,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          recencyScore: 0.5,
          frequencyScore: 0.5,
          confidenceScore: 0.5,
          userRelevanceScore: 0.5,
        },
      },
    ];
    const repo = {
      getAll: vi.fn(async () => threads),
      getById: vi.fn(async (id: string) => threads.find((t) => t.id === id) ?? null),
      save: vi.fn(async () => undefined),
      update: vi.fn(async () => undefined),
    };

    await useThreadsStore.getState().loadFromRepository(repo as never);
    expect(useThreadsStore.getState().threads).toHaveLength(1);
    expect(repo.getAll).toHaveBeenCalled();
  });

  it('adds impulse and reloads recent list', async () => {
    const saved: unknown[] = [];
    const repo = {
      findRecent: vi.fn(async () => saved as never[]),
      save: vi.fn(async (i: unknown) => {
        saved.push(i);
      }),
    };

    const impulse = await useImpulsesStore.getState().addImpulse(
      repo as never,
      { text: 'Gedanke' },
      ['t1'],
    );

    expect(impulse.links.threadIds).toEqual(['t1']);
    expect(repo.save).toHaveBeenCalled();
    expect(repo.findRecent).toHaveBeenCalled();
  });
});
