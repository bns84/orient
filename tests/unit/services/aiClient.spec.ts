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
});
