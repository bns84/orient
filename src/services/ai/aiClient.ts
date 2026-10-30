/**
 * Optionaler KI-Client — spricht standardmäßig mit dem Pförtner (OpenAI-kompatibel), ohne Schlüssel.
 * Blockiert nie; bei Fehler → null.
 */

import { buildOrientSystemPrompt } from './systemPrompt';
import { orientServerUrl } from '../orient/serverUrl';

const TIMEOUT_MS = 12_000;

export function isAiEnrichmentEnabled(): boolean {
  return import.meta.env.VITE_AI_ENABLED === 'true';
}

function apiBase(): string {
  // Standard: der Pförtner (dort liegen die Schlüssel, nicht im Browser)
  const custom = import.meta.env.VITE_AI_API_URL?.trim();
  return (custom || `${orientServerUrl()}/v1`).replace(/\/$/, '');
}

function model(): string {
  return import.meta.env.VITE_AI_MODEL?.trim() || 'gpt-4o-mini';
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1]!.trim() : trimmed;
  return JSON.parse(raw) as unknown;
}

/**
 * POST …/chat/completions (OpenAI-kompatibel: OpenRouter, LiteLLM, lokaler Proxy).
 */
export async function aiJsonComplete<T>(params: {
  task: string;
  userPrompt: string;
  companionName?: string;
}): Promise<T | null> {
  if (!isAiEnrichmentEnabled()) return null;

  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const res = await fetch(`${apiBase()}/chat/completions`, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: model(),
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: buildOrientSystemPrompt(params.companionName ?? 'ORIENT'),
          },
          {
            role: 'user',
            content: `[task:${params.task}]\n${params.userPrompt}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const { logEvent } = await import('../../db/events');
      await logEvent('ai.error', { task: params.task, status: res.status });
      return null;
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return null;

    return extractJson(content) as T;
  } catch (err) {
    try {
      const { logEvent } = await import('../../db/events');
      await logEvent('ai.error', {
        task: params.task,
        message: err instanceof Error ? err.message : String(err),
      });
    } catch {
      // still silent for UI
    }
    return null;
  } finally {
    globalThis.clearTimeout(timer);
  }
}
