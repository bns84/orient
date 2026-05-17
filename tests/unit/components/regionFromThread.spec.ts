import { describe, expect, it } from 'vitest';
import {
  hasRegionTag,
  regionIdFromText,
  regionIndexForThread,
  regionTagForText,
  withRegionTag,
} from '../../../src/components/Bubble/regionFromThread';
import type { Thread } from '../../../src/core/threads/Thread';
import { ThreadStatus } from '../../../src/core/threads/ThreadStatus';

function thread(title: string, tags?: string[]): Thread {
  return {
    id: 't1',
    title,
    status: ThreadStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags,
    metrics: {
      recencyScore: 0.5,
      frequencyScore: 0.5,
      confidenceScore: 0.5,
      userRelevanceScore: 0.5,
    },
  };
}

describe('regionFromThread', () => {
  it('maps keywords to stable region ids', () => {
    expect(regionIdFromText('Ich habe Angst vor morgen')).toBe('emotion');
    expect(regionIdFromText('Team-Meeting mit Kollegen')).toBe('social');
    expect(regionIdFromText('Strategie und Roadmap fürs Projekt')).toBe('strategy');
    expect(regionTagForText('Design und kreative Idee')).toBe('region:creative');
  });

  it('prefers region: tag on thread', () => {
    expect(regionIndexForThread(thread('Beliebiger Titel', ['region:memory', 'x']))).toBe(4);
    expect(regionIndexForThread(thread('Sprache und Text'))).toBe(2);
  });

  it('withRegionTag adds tag only when missing', () => {
    const bare = thread('Team und Kollegen');
    expect(hasRegionTag(bare)).toBe(false);
    const tagged = withRegionTag(bare, 'Team-Meeting mit Kollegen');
    expect(tagged.tags?.[0]).toBe('region:social');
    expect(withRegionTag(tagged, 'x').tags).toEqual(tagged.tags);
  });
});
