import { describe, expect, it } from 'vitest';
import { ContextMode } from '../../../src/core/escalation/ContextMode';
import { contextBubbleModifier } from '../../../src/components/Bubble/contextBubbleModifiers';

describe('contextBubbleModifier', () => {
  it('dims in quiet modes', () => {
    const m = contextBubbleModifier(ContextMode.QUIET);
    expect(m.activationScale).toBeLessThan(1);
    expect(m.extraActiveRegions).toHaveLength(0);
  });

  it('boosts logic and strategy in focus', () => {
    const m = contextBubbleModifier(ContextMode.FOCUS);
    expect(m.activationScale).toBeGreaterThan(1);
    expect(m.extraActiveRegions).toEqual([3, 5]);
  });
});
