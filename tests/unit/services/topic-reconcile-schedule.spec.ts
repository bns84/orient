import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  markPeriodicTopicReconcileDone,
  shouldRunPeriodicTopicReconcile,
  TOPIC_RECONCILE_INTERVAL_MS,
} from '../../../src/services/topic-reconcile-schedule';

describe('topic-reconcile-schedule', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    });
  });

  it('runs full reconcile when never run before', () => {
    expect(shouldRunPeriodicTopicReconcile()).toBe(true);
  });

  it('skips until interval elapsed', () => {
    markPeriodicTopicReconcileDone(1_000_000);
    expect(shouldRunPeriodicTopicReconcile(1_000_000 + TOPIC_RECONCILE_INTERVAL_MS - 1)).toBe(
      false,
    );
    expect(shouldRunPeriodicTopicReconcile(1_000_000 + TOPIC_RECONCILE_INTERVAL_MS)).toBe(true);
  });
});
