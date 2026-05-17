import { describe, expect, it } from 'vitest';
import { ImpulseFactory } from '../../../src/core/impulses/ImpulseFactory';
import { ThreadStatus } from '../../../src/core/threads/ThreadStatus';
import {
  CAPTURE_MATCH_OPTIONS,
  detectTopicCluster,
  findBestThreadMatch,
  germanStem,
  scoreThreadMatch,
} from '../../../src/services/topic-matching';

describe('topic-matching', () => {
  it('clusters impulses with shared multi-word context (Projekt Alpha)', () => {
    const impulses = [
      'Projekt Alpha Planung',
      'Nochmal Projekt Alpha Termine',
      'Projekt Alpha Budget',
    ].map((text, i) =>
      ImpulseFactory.create({
        id: `i${i}`,
        content: { text },
        createdAt: new Date(),
      }),
    );

    const cluster = detectTopicCluster(impulses);
    expect(cluster).not.toBeNull();
    expect(cluster!.impulses.length).toBeGreaterThanOrEqual(2);
    expect(cluster!.title.toLowerCase()).toContain('projekt');
    expect(cluster!.title.toLowerCase()).toContain('alpha');
  });

  it('capture match requires stronger score than auto-link', () => {
    const threads = [
      {
        id: 't1',
        title: 'Arbeit',
        status: ThreadStatus.ACTIVE,
        tags: ['arbeit'],
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

    const vague = findBestThreadMatch('Heute war anstrengend', threads, CAPTURE_MATCH_OPTIONS);
    expect(vague).toBeNull();

    const clear = findBestThreadMatch('Heute viel Arbeit im Büro', threads, CAPTURE_MATCH_OPTIONS);
    expect(clear?.id).toBe('t1');
    expect(scoreThreadMatch('Heute viel Arbeit im Büro', threads[0]!)).toBeGreaterThanOrEqual(7);
  });

  it('matches inflected forms via germanStem (arbeite → Arbeit)', () => {
    const threads = [
      {
        id: 't1',
        title: 'Arbeit',
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

    expect(germanStem('arbeiten')).toBe('arbeit');
    expect(germanStem('arbeite')).toBe('arbeit');

    const match = findBestThreadMatch('Heute musste ich viel arbeiten', threads, CAPTURE_MATCH_OPTIONS);
    expect(match?.id).toBe('t1');
  });

  it('rejects ambiguous matches between two similar topics', () => {
    const threads = [
      {
        id: 't1',
        title: 'Projekt Alpha',
        status: ThreadStatus.ACTIVE,
        tags: ['projekt', 'alpha'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          recencyScore: 0.5,
          frequencyScore: 0.5,
          confidenceScore: 0.5,
          userRelevanceScore: 0.5,
        },
      },
      {
        id: 't2',
        title: 'Projekt Beta',
        status: ThreadStatus.ACTIVE,
        tags: ['projekt', 'beta'],
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

    const vague = findBestThreadMatch('Heute war ein ruhiger Tag', threads, CAPTURE_MATCH_OPTIONS);
    expect(vague).toBeNull();
  });
});
