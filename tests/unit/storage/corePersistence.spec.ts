import { describe, it, expect } from 'vitest';
import { deserializeCoreValue, serializeCoreValue } from '@infrastructure/storage/corePersistence';

describe('corePersistence', () => {
  it('roundtrips dates in nested objects', () => {
    const input = {
      id: 't1',
      createdAt: new Date('2026-05-15T12:00:00.000Z'),
      metrics: { updatedAt: new Date('2026-05-16T08:00:00.000Z') },
    };
    const out = deserializeCoreValue<typeof input>(serializeCoreValue(input));
    expect(out.createdAt).toBeInstanceOf(Date);
    expect(out.metrics.updatedAt.toISOString()).toBe('2026-05-16T08:00:00.000Z');
  });
});
