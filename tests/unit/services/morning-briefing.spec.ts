import { describe, expect, it, vi, beforeEach } from 'vitest';

const kv = new Map<string, unknown>();

vi.mock('../../../src/db/kv', () => ({
  kvGet: vi.fn(async (key: string, fallback: unknown) =>
    kv.has(key) ? kv.get(key) : fallback,
  ),
  kvSet: vi.fn(async (key: string, value: unknown) => {
    kv.set(key, value);
  }),
}));

import {
  markMorningBriefingShown,
  shouldShowMorningBriefing,
  touchSessionActivity,
} from '../../../src/services/morning-briefing';

describe('morning-briefing', () => {
  beforeEach(() => {
    kv.clear();
  });

  it('does not show before 6:00', async () => {
    const early = new Date('2026-05-17T05:30:00');
    expect(await shouldShowMorningBriefing(early)).toBe(false);
  });

  it('shows on first morning open of the day', async () => {
    const morning = new Date('2026-05-17T08:00:00');
    expect(await shouldShowMorningBriefing(morning)).toBe(true);
  });

  it('does not show again after dismiss same day', async () => {
    const morning = new Date('2026-05-17T08:00:00');
    await markMorningBriefingShown(morning);
    expect(await shouldShowMorningBriefing(morning)).toBe(false);
  });

  it('shows next day if last session was yesterday', async () => {
    const yesterday = new Date('2026-05-16T20:00:00');
    await touchSessionActivity(yesterday);
    const today = new Date('2026-05-17T09:00:00');
    expect(await shouldShowMorningBriefing(today)).toBe(true);
  });

  it('does not show again same day after activity', async () => {
    const today = new Date('2026-05-17T10:00:00');
    await touchSessionActivity(today);
    await markMorningBriefingShown(today);
    expect(await shouldShowMorningBriefing(today)).toBe(false);
  });
});
