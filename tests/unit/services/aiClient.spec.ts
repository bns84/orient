import { afterEach, describe, expect, it, vi } from 'vitest';

describe('aiClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('is disabled without env', async () => {
    vi.stubEnv('VITE_AI_ENABLED', 'false');
    vi.resetModules();
    const { isAiEnrichmentEnabled } = await import('../../../src/services/ai/aiClient');
    expect(isAiEnrichmentEnabled()).toBe(false);
  });

  it('is enabled with url', async () => {
    vi.stubEnv('VITE_AI_ENABLED', 'true');
    vi.stubEnv('VITE_AI_API_URL', 'https://api.example.com/v1');
    vi.resetModules();
    const { isAiEnrichmentEnabled } = await import('../../../src/services/ai/aiClient');
    expect(isAiEnrichmentEnabled()).toBe(true);
  });

  it('parses json from chat completion', async () => {
    vi.stubEnv('VITE_AI_ENABLED', 'true');
    vi.stubEnv('VITE_AI_API_URL', 'https://api.example.com/v1');
    vi.resetModules();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"lines":["Hallo","Welt"]}' } }],
        }),
      })),
    );

    const { aiJsonComplete } = await import('../../../src/services/ai/aiClient');
    const res = await aiJsonComplete<{ lines: string[] }>({
      task: 'test',
      userPrompt: 'ping',
    });
    expect(res?.lines).toEqual(['Hallo', 'Welt']);
  });

  it('talks to the Pförtner by default, without any key', async () => {
    vi.stubEnv('VITE_AI_ENABLED', 'true');
    vi.stubEnv('VITE_AI_API_URL', '');
    vi.resetModules();

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"a":1}' } }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { aiJsonComplete } = await import('../../../src/services/ai/aiClient');
    await aiJsonComplete({ task: 't', userPrompt: 'p' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
    expect(url).toBe('http://127.0.0.1:8787/v1/chat/completions');
    expect(init.headers.Authorization).toBeUndefined();
  });
});
