/**
 * Serialisierung für Dexie-Core-Store (Date → markiertes Objekt)
 */

const DATE_MARKER = '__orientDate';

function walkSerialize(value: unknown): unknown {
  if (value instanceof Date) {
    return { [DATE_MARKER]: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map(walkSerialize);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = walkSerialize(v);
    }
    return out;
  }
  return value;
}

function walkDeserialize(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const rec = value as Record<string, unknown>;
    if (DATE_MARKER in rec && typeof rec[DATE_MARKER] === 'string') {
      return new Date(rec[DATE_MARKER]);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rec)) {
      out[k] = walkDeserialize(v);
    }
    return out;
  }
  if (Array.isArray(value)) {
    return value.map(walkDeserialize);
  }
  return value;
}

export function serializeCoreValue<T>(value: T): unknown {
  return walkSerialize(value);
}

export function deserializeCoreValue<T>(value: unknown): T {
  return walkDeserialize(value) as T;
}
