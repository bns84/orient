import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { loadConfig } from '../../../server/src/config';
import { Brain } from '../../../server/src/store';
import { MockModel } from '../../../server/src/models/mock';
import { Orient } from '../../../server/src/orient';
import { createHttpServer } from '../../../server/src/http';
import { HttpEar, MockEar } from '../../../server/src/ear';

async function start(ear: MockEar | HttpEar | null) {
  const config = loadConfig({ root: '/tmp/x', env: { ORIENT_DB_PATH: ':memory:' }, readEnvFile: false });
  const brain = await Brain.open(':memory:');
  const orient = new Orient(brain, new MockModel(), config);
  const server = createHttpServer(orient, ear);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

describe('Ohr', () => {
  it('Einstellungen: Dolmetscher-Adresse ist die vierte Schraube', () => {
    const c = loadConfig({ root: '/tmp/x', env: {}, readEnvFile: false });
    expect(c.ear.url).toBe('http://127.0.0.1:8788');
    expect(c.ear.mode).toBe('whisper');
    const c2 = loadConfig({ root: '/tmp/x', env: { ORIENT_EAR_URL: 'http://192.168.0.5:9000/', ORIENT_EAR: 'mock' }, readEnvFile: false });
    expect(c2.ear.url).toBe('http://192.168.0.5:9000');
    expect(c2.ear.mode).toBe('mock');
  });

  it('/api/hear gibt die Aufnahme an das Ohr und liefert Text', async () => {
    const ear = new MockEar('Hallo ORIENT');
    const { server, base } = await start(ear);
    try {
      const res = await fetch(`${base}/api/hear?lang=de`, {
        method: 'POST',
        headers: { 'content-type': 'audio/webm' },
        body: new Uint8Array([1, 2, 3, 4]),
      });
      expect(res.status).toBe(200);
      expect(((await res.json()) as { text: string }).text).toBe('Hallo ORIENT');
      expect(ear.calls).toEqual([{ bytes: 4, mime: 'audio/webm', language: 'de' }]);

      const empty = await fetch(`${base}/api/hear`, { method: 'POST', body: new Uint8Array() });
      expect(empty.status).toBe(400);

      const health = (await (await fetch(`${base}/api/health`)).json()) as { ear: { mode: string; ready: boolean } };
      expect(health.ear).toEqual({ mode: 'mock', ready: true });
    } finally {
      server.close();
    }
  });

  it('ohne Ohr: freundliche Meldung (503)', async () => {
    const { server, base } = await start(null);
    try {
      const res = await fetch(`${base}/api/hear`, { method: 'POST', body: new Uint8Array([1]) });
      expect(res.status).toBe(503);
    } finally {
      server.close();
    }
  });

  it('echter Weg zum Dolmetscher (Ersatz-Dolmetscher) und Meldung, wenn er fehlt', async () => {
    const fake = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200).end('{"ok":true}');
        return;
      }
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ text: ` ${Buffer.concat(chunks).length} Bytes gehört `, language: 'de' }));
      });
    });
    await new Promise<void>((r) => fake.listen(0, '127.0.0.1', r));
    const earUrl = `http://127.0.0.1:${(fake.address() as AddressInfo).port}`;
    const { server, base } = await start(new HttpEar(earUrl, 5000));
    try {
      const res = await fetch(`${base}/api/hear`, { method: 'POST', body: new Uint8Array([9, 9, 9]) });
      expect(((await res.json()) as { text: string }).text).toBe('3 Bytes gehört');
    } finally {
      server.close();
      fake.close();
    }

    const down = await start(new HttpEar('http://127.0.0.1:1', 2000));
    try {
      const res = await fetch(`${down.base}/api/hear`, { method: 'POST', body: new Uint8Array([1]) });
      expect(res.status).toBe(503);
      expect(((await res.json()) as { error: string }).error).toContain('Dolmetscher');
    } finally {
      down.server.close();
    }
  });
});
