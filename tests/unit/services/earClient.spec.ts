import { afterEach, describe, expect, it, vi } from 'vitest';
import { earMode, hearPfoertner } from '../../../src/services/orient/earClient';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Ohr in der App', () => {
  it('Standard ist das eigene Ohr, Schalter auf Browser möglich', () => {
    vi.stubGlobal('localStorage', fakeStorage());
    expect(earMode()).toBe('own');
    vi.stubGlobal('localStorage', fakeStorage({ 'orient.ear': 'browser' }));
    expect(earMode()).toBe('browser');
  });

  it('schickt die Aufnahme an den Pförtner und liest den Text', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: ' Hallo ' }), { status: 200 }));
    vi.stubGlobal('fetch', f);
    const r = await hearPfoertner(new Blob(['x'], { type: 'audio/webm' }));
    expect(r).toEqual({ ok: true, text: 'Hallo' });
    expect(String(f.mock.calls[0]![0])).toContain('/api/hear?lang=de');
  });

  it('gibt eine verständliche Meldung, wenn das Ohr fehlt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Dolmetscher aus' }), { status: 503 })));
    expect(await hearPfoertner(new Blob(['x']))).toEqual({ ok: false, message: 'Dolmetscher aus' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('net')));
    const r = await hearPfoertner(new Blob(['x']));
    expect(r.ok).toBe(false);
  });
});
