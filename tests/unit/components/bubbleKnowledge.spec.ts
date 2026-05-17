import { describe, expect, it } from 'vitest';
import {
  buildBubbleKnowledge,
  detectSortHighlightRegion,
} from '../../../src/components/Bubble/bubbleKnowledge';
import type { Impulse } from '../../../src/core/impulses/Impulse';
import { ImpulseState } from '../../../src/core/impulses/ImpulseState';
import type { Thread } from '../../../src/core/threads/Thread';
import { ThreadStatus } from '../../../src/core/threads/ThreadStatus';

function imp(id: string, text: string, threadIds: string[] = []): Impulse {
  return {
    id,
    createdAt: new Date(),
    content: { text },
    state: ImpulseState.DUST,
    links: { threadIds, entityIds: [] },
    meta: { pinned: false },
  };
}

function thread(id: string, title: string): Thread {
  return {
    id,
    title,
    status: ThreadStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    metrics: {
      recencyScore: 0.5,
      frequencyScore: 0.5,
      confidenceScore: 0.5,
      userRelevanceScore: 0.5,
    },
  };
}

describe('buildBubbleKnowledge', () => {
  it('starts nearly empty', () => {
    const k = buildBubbleKnowledge([], []);
    expect(k.totalImpulses).toBe(0);
    expect(k.activation).toBeLessThan(0.1);
  });

  it('puts unlinked impulses in core', () => {
    const k = buildBubbleKnowledge([imp('1', 'roher Gedanke')], []);
    expect(k.unlinkedInCore).toBe(1);
    expect(k.coreFill).toBeGreaterThan(0.4);
    expect(k.maturity).toBe(0);
  });

  it('fills regions when linked', () => {
    const threads = [thread('t1', 'Sprache und Text')];
    const impulses = [imp('1', 'Notiz', ['t1'])];
    const k = buildBubbleKnowledge(impulses, threads);
    expect(k.maturity).toBe(1);
    expect(k.regionFill[2]).toBeGreaterThan(0);
  });

  it('detects sort highlight on region growth', () => {
    const prev = buildBubbleKnowledge([imp('1', 'noch offen')], []);
    const next = buildBubbleKnowledge(
      [imp('1', 'noch offen'), imp('2', 'Strategie und Ziel', ['t1'])],
      [thread('t1', 'Strategie Ziel')],
    );
    expect(detectSortHighlightRegion(prev, next)).not.toBeNull();
  });
});
