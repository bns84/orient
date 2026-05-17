import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../src/db/events', () => ({
  logEvent: vi.fn(async () => undefined),
}));

import { ImpulseFactory } from '../../../src/core/impulses/ImpulseFactory';
import { runAutoTopicEngine } from '../../../src/services/auto-topic-engine';

describe('auto-topic-engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates topic and links impulses automatically (no user prompt)', async () => {
    const impulses: unknown[] = [];
    const threads: unknown[] = [];

    const impulseRepo = {
      getAll: async () => impulses as never[],
      findRecent: async () => impulses as never[],
      findByThread: async (threadId: string) =>
        (impulses as { links: { threadIds: string[] } }[]).filter((i) =>
          i.links.threadIds.includes(threadId),
        ) as never[],
      getById: async (id: string) => (impulses as { id: string }[]).find((i) => i.id === id) ?? null,
      save: async (i: unknown) => {
        const idx = (impulses as { id: string }[]).findIndex((x) => x.id === (i as { id: string }).id);
        if (idx >= 0) impulses[idx] = i;
        else impulses.push(i);
      },
    };

    const threadRepo = {
      getAll: async () => threads as never[],
      getById: async (id: string) => (threads as { id: string }[]).find((t) => t.id === id) ?? null,
      save: async (t: unknown) => {
        threads.push(t);
      },
      update: async (t: unknown) => {
        const idx = (threads as { id: string }[]).findIndex((x) => x.id === (t as { id: string }).id);
        if (idx >= 0) threads[idx] = t;
      },
    };

    const edgeRepo = { getAll: async () => [], save: async () => undefined };

    const texts = ['Projekt Alpha Planung', 'Nochmal Projekt Alpha Termine', 'Projekt Alpha Budget'];
    for (const text of texts) {
      impulses.push(
        ImpulseFactory.create({
          id: `imp-${text.length}`,
          content: { text },
          createdAt: new Date(),
        }),
      );
    }

    const result = await runAutoTopicEngine({ impulseRepo, threadRepo, edgeRepo });

    expect(result.threadsCreated).toBeGreaterThanOrEqual(1);
    expect(result.impulsesLinked).toBeGreaterThanOrEqual(2);
    expect(threads.length).toBeGreaterThanOrEqual(1);
    expect((impulses[0] as { links: { threadIds: string[] } }).links.threadIds.length).toBeGreaterThan(0);

    const created = threads[0] as { tags?: string[] };
    expect(created.tags?.some((t) => t.startsWith('region:'))).toBe(true);
    expect(created.tags?.[0]).toMatch(/^region:strategy$/);
  });
});
