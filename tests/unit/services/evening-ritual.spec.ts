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
  buildEveningRitualLine,
  markEveningRitualShown,
  shouldShowEveningRitual,
} from '../../../src/services/evening-ritual';

describe('evening-ritual', () => {
  beforeEach(() => {
    kv.clear();
  });

  it('does not show before 21:00', async () => {
    const evening = new Date('2026-05-17T20:30:00');
    const lastActive = evening.getTime() - 45 * 60 * 1000;
    expect(await shouldShowEveningRitual(evening, lastActive)).toBe(false);
  });

  it('shows after 21:00 with 30min idle', async () => {
    const now = new Date('2026-05-17T21:45:00');
    const lastActive = now.getTime() - 35 * 60 * 1000;
    expect(await shouldShowEveningRitual(now, lastActive)).toBe(true);
  });

  it('does not show if idle under 30 minutes', async () => {
    const now = new Date('2026-05-17T22:00:00');
    const lastActive = now.getTime() - 10 * 60 * 1000;
    expect(await shouldShowEveningRitual(now, lastActive)).toBe(false);
  });

  it('does not show again after dismiss same day', async () => {
    const now = new Date('2026-05-17T22:00:00');
    const lastActive = now.getTime() - 40 * 60 * 1000;
    await markEveningRitualShown(now);
    expect(await shouldShowEveningRitual(now, lastActive)).toBe(false);
  });

  it('builds companion line', () => {
    expect(buildEveningRitualLine('Luna')).toBe('Luna, gute Nacht. Gibt es noch etwas?');
  });
});
