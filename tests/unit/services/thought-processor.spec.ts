import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/db/events', () => ({
  logEvent: vi.fn(async () => undefined),
}));
import { ThreadStatus } from '../../../src/core/threads/ThreadStatus';
import { ImpulseFactory } from '../../../src/core/impulses/ImpulseFactory';
import { ImpulseState } from '../../../src/core/impulses/ImpulseState';
import {
  findBestThreadMatch,
  generateMorningBriefing,
  processCapturedThought,
  titleFromThought,
} from '../../../src/services/thought-processor';

describe('thought-processor', () => {
  it('titleFromThought uses first words', () => {
    expect(titleFromThought('Familie morgen besuchen\nDetails')).toBe('Familie morgen besuchen');
  });

  it('findBestThreadMatch links short titles (Arbeit, Design)', () => {
    const threads = [
      {
        id: 't1',
        title: 'Arbeit',
        status: ThreadStatus.ACTIVE,
        tags: ['arbeit'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { recencyScore: 0.5, frequencyScore: 0.5, confidenceScore: 0.5, userRelevanceScore: 0.5 },
      },
      {
        id: 't2',
        title: 'Design',
        status: ThreadStatus.OBSERVED,
        tags: ['design'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { recencyScore: 0.5, frequencyScore: 0.5, confidenceScore: 0.5, userRelevanceScore: 0.5 },
      },
    ];
    expect(findBestThreadMatch('Heute viel Arbeit im Büro', threads)?.id).toBe('t1');
    expect(findBestThreadMatch('Neues Design für die App', threads)?.id).toBe('t2');
  });

  it('findBestThreadMatch links by title overlap', () => {
    const threads = [
      {
        id: 't1',
        title: 'Familie',
        status: ThreadStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { recencyScore: 0.5, frequencyScore: 0.5, confidenceScore: 0.5, userRelevanceScore: 0.5 },
      },
      {
        id: 't2',
        title: 'Arbeit',
        status: ThreadStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: { recencyScore: 0.5, frequencyScore: 0.5, confidenceScore: 0.5, userRelevanceScore: 0.5 },
      },
    ];
    const match = findBestThreadMatch('Heute zur Familie fahren', threads);
    expect(match?.id).toBe('t1');
  });

  it('processCapturedThought leaves impulse unlinked when no match (Sammelcontainer)', async () => {
    const threads: unknown[] = [];
    const edges: unknown[] = [];

    const threadRepo = {
      getById: async () => null,
      save: async (t: unknown) => {
        threads.push(t);
      },
      update: async (t: unknown) => {
        const i = threads.findIndex((x: any) => x.id === (t as any).id);
        if (i >= 0) threads[i] = t;
      },
      getAll: async () => threads as any[],
    };

    const edgeRepo = {
      getAll: async () => edges as any[],
      save: async (e: unknown) => {
        edges.push(e);
      },
    };

    const impulse = ImpulseFactory.create({
      id: 'imp-1',
      content: { text: 'Neue Idee für Origami' },
      createdAt: new Date(),
    });

    const result = await processCapturedThought(impulse, { threadRepo, edgeRepo });

    expect(result.createdThread).toBe(false);
    expect(result.threadId).toBe('');
    expect(result.impulse.links.threadIds).toHaveLength(0);
    expect(threads.length).toBe(0);
    expect(edges.length).toBe(0);
  });

  it('generateMorningBriefing summarizes last 24h', () => {
    const now = new Date('2026-05-16T12:00:00Z');
    const impulses = [
      {
        ...ImpulseFactory.create({
          id: 'i1',
          content: { text: 'Test' },
          createdAt: new Date('2026-05-16T10:00:00Z'),
        }),
        links: { threadIds: ['t1'], entityIds: [] },
      },
    ];
    const threads = [
      {
        id: 't1',
        title: 'Familie',
        status: ThreadStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
        metrics: { recencyScore: 0.5, frequencyScore: 0.5, confidenceScore: 0.5, userRelevanceScore: 0.5 },
      },
    ];

    const lines = generateMorningBriefing({
      companionName: 'Neona',
      impulses,
      threads,
      now,
    });

    expect(lines[0]).toContain('Neona');
    expect(lines.some((l) => l.includes('1 Gedanke'))).toBe(true);
  });
});
