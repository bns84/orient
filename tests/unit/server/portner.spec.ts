import { describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { loadConfig, parseEnvText } from '../../../server/src/config';
import { Brain } from '../../../server/src/store';
import { MockModel } from '../../../server/src/models/mock';
import { ModelError } from '../../../server/src/models/types';
import { Orient } from '../../../server/src/orient';
import { createHttpServer } from '../../../server/src/http';
import { parseCommand } from '../../../server/src/tree/commands';
import { formatUsd, parseUntilClock, berlinDayStartMs } from '../../../server/src/time';

const NOW = new Date('2026-10-30T10:00:00Z'); // 11:00 Berlin (MEZ)

function setup(opts: ConstructorParameters<typeof MockModel>[0] = {}, env: Record<string, string> = {}) {
  const config = loadConfig({ root: '/tmp/x', env: { ORIENT_DB_PATH: ':memory:', ...env }, readEnvFile: false });
  const model = new MockModel(opts);
  return Brain.open(':memory:').then((brain) => ({
    brain,
    model,
    config,
    orient: new Orient(brain, model, config, undefined, () => NOW),
  }));
}

describe('Config', () => {
  it('liest .env-Text und setzt Standardwerte', () => {
    expect(parseEnvText('A=1\n# x\nB="zwei"\n')).toEqual({ A: '1', B: 'zwei' });
    const c = loadConfig({ root: '/tmp/x', env: {}, readEnvFile: false });
    expect(c.host).toBe('127.0.0.1');
    expect(c.port).toBe(8787);
    expect(c.dailyLimitUsd).toBe(2);
  });
});

describe('Befehle', () => {
  it('erkennt Regeln, Limit und Auflisten', () => {
    expect(parseCommand('Tageslimit auf 3 Dollar', NOW)).toEqual({ type: 'set_limit', usd: 3 });
    expect(parseCommand('Welche Regeln gelten?', NOW)).toEqual({ type: 'list_rules' });
    expect(parseCommand('Regel 2 ausschalten', NOW)).toEqual({ type: 'disable_rule', index: 2 });
    expect(parseCommand('Regel: Sei kurz', NOW)).toMatchObject({ type: 'add_rule', text: 'Sei kurz' });
    expect(parseCommand('Wie wird das Wetter?', NOW)).toBeNull();
  });
});

describe('Zeit', () => {
  it('bis 21:30 ergibt einen Zeitpunkt, Tagesbeginn liegt vor jetzt', () => {
    const until = parseUntilClock('Antworte kurz bis 21:30', NOW);
    expect(until).not.toBeNull();
    expect(until!).toBeGreaterThan(NOW.getTime());
    expect(berlinDayStartMs(NOW)).toBeLessThanOrEqual(NOW.getTime());
    expect(formatUsd(1.5)).toBe('1,50');
  });
});

describe('Pförtner', () => {
  it('beantwortet über das Modell und zählt Kosten', async () => {
    const { orient, model, brain } = await setup();
    const r = await orient.ask({ text: 'Hallo' });
    expect(r.status).toBe('ok');
    expect(r.answer).toContain('Hallo');
    expect(model.requests).toHaveLength(1);
    expect(r.usage.costUsd).toBeGreaterThan(0);
    expect(brain.recentMessages('local-user', 10).length).toBe(2);
  });

  it('gilt eine Regel nur bis zum Verfallsdatum', async () => {
    const { orient, model, brain } = await setup();
    brain.addRule({ userId: 'local-user', text: 'REGEL-A', now: NOW.getTime() - 1000, validUntil: NOW.getTime() + 60_000 });
    brain.addRule({ userId: 'local-user', text: 'REGEL-ALT', now: NOW.getTime() - 5000, validUntil: NOW.getTime() - 1000 });
    await orient.ask({ text: 'Hallo' });
    const system = model.requests[0]!.system;
    expect(system).toContain('REGEL-A');
    expect(system).not.toContain('REGEL-ALT');
  });

  it('Regel per Befehl: anlegen, ändern, ausschalten – nichts wird gelöscht', async () => {
    const { orient, model, brain } = await setup();
    const add = await orient.ask({ text: 'Regel: Antworte immer kurz' });
    expect(add.rulesChanged).toBe(true);
    expect(model.requests).toHaveLength(0);
    await orient.ask({ text: 'Regel 1 ändern zu: Antworte sehr kurz' });
    expect(brain.listRules('local-user')).toHaveLength(2);
    expect(brain.activeRules('local-user', NOW.getTime()).map((r) => r.text)).toEqual(['Antworte sehr kurz']);
    await orient.ask({ text: 'Regel 1 ausschalten' });
    expect(brain.activeRules('local-user', NOW.getTime())).toHaveLength(0);
    expect(brain.listRules('local-user')).toHaveLength(2);
  });

  it('Kostenbremse hält an, ohne das Modell zu fragen', async () => {
    const { orient, model } = await setup();
    await orient.ask({ text: 'Tageslimit auf 0 Dollar' });
    const r = await orient.ask({ text: 'Hallo' });
    expect(r.status).toBe('stopped');
    expect(model.requests).toHaveLength(0);
  });

  it('Modellfehler wird als Fehler gemeldet', async () => {
    const { orient } = await setup({ failWith: new ModelError('http', 'kaputt', 500) });
    const r = await orient.ask({ text: 'Hallo' });
    expect(r.status).toBe('error');
    expect(r.answer.length).toBeGreaterThan(0);
  });

  it('Abbrechen hält die Anfrage an', async () => {
    const { orient } = await setup({ delayMs: 500 });
    const p = orient.ask({ text: 'Hallo', requestId: 'r1' });
    await new Promise((r) => setTimeout(r, 20));
    expect(orient.cancel('r1')).toBe(true);
    expect((await p).status).toBe('cancelled');
  });

  it('Nachschieben: alte Anfrage endet, neue enthält beide Sätze', async () => {
    const { orient, model } = await setup({ delayMs: 100 });
    const p1 = orient.ask({ text: 'Erster Satz', requestId: 'a' });
    await new Promise((r) => setTimeout(r, 20));
    const p2 = orient.ask({ text: 'Zweiter Satz', requestId: 'b' });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe('cancelled');
    expect(r1.replacedBy).toBe('b');
    expect(r2.status).toBe('ok');
    const last = model.requests[model.requests.length - 1]!;
    const joined = last.messages.map((m) => m.content).join('\n');
    expect(joined).toContain('Erster Satz');
    expect(joined).toContain('Zweiter Satz');
  });
});

describe('Haustür (HTTP)', () => {
  it('Health, fremde Herkunft, Aufgaben-Weg', async () => {
    const { orient } = await setup();
    const server = createHttpServer(orient);
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const health = await fetch(`${base}/api/health`);
      expect(health.status).toBe(200);

      const foreign = await fetch(`${base}/api/health`, { headers: { origin: 'http://boese.example' } });
      expect(foreign.status).toBe(403);

      const own = await fetch(`${base}/api/health`, { headers: { origin: 'http://localhost:3000' } });
      expect(own.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');

      const ask = await fetch(`${base}/api/ask`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'Hallo' }),
      });
      expect(((await ask.json()) as { status: string }).status).toBe('ok');

      const task = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'system', content: 's' }, { role: 'user', content: 'x' }] }),
      });
      const body = (await task.json()) as { choices: { message: { content: string } }[] };
      expect(body.choices[0]!.message.content).toContain('x');

      const bad = await fetch(`${base}/v1/chat/completions`, { method: 'POST', body: '{}' });
      expect(bad.status).toBe(400);
    } finally {
      server.close();
    }
  });
});
