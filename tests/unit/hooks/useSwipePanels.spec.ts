import { describe, expect, it } from 'vitest';
import { resolveSwipeTransition } from '../../../src/hooks/useSwipePanels';

describe('resolveSwipeTransition', () => {
  it('main: swipe right opens topics', () => {
    expect(resolveSwipeTransition('main', 80, 5)).toBe('topics');
  });

  it('main: swipe down opens detail', () => {
    expect(resolveSwipeTransition('main', 5, 80)).toBe('detail');
  });

  it('topics: swipe left returns to main', () => {
    expect(resolveSwipeTransition('topics', -80, 5)).toBe('main');
  });

  it('detail: swipe up returns to main', () => {
    expect(resolveSwipeTransition('detail', 5, -80)).toBe('main');
  });

  it('ignores weak gestures', () => {
    expect(resolveSwipeTransition('main', -20, 0)).toBeNull();
  });
});
