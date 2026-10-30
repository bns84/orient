/**
 * Anschluss ChatGPT (OpenAI Chat Completions).
 * Der Modellname kommt aus dem Recherche-Doc und ist nicht selbst geprüft.
 * Nicht gegen den echten Dienst getestet — dafür fehlt in der Bau-Umgebung der Zugang.
 */

import type { Prices } from '../config.js';
import {
  ModelError,
  extractApiError,
  type ModelClient,
  type ModelRequest,
  type ModelResponse,
} from './types.js';

export interface OpenAiOptions {
  apiKey: string;
  model: string;
  baseUrl: string;
  prices: Prices;
  fetchImpl?: typeof fetch;
}

export function createOpenAiClient(opts: OpenAiOptions): ModelClient {
  const doFetch = opts.fetchImpl ?? fetch;

  return {
    id: 'openai',
    label: 'ChatGPT',
    model: opts.model,
    ready: Boolean(opts.apiKey),
    prices: opts.prices,

    async complete(req: ModelRequest): Promise<ModelResponse> {
      if (!opts.apiKey) {
        throw new ModelError(
          'no_key',
          'Es fehlt der OpenAI-Schlüssel. Er gehört in die Datei server\\.env hinter OPENAI_API_KEY=.',
        );
      }

      let res: Response;
      try {
        res = await doFetch(`${opts.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${opts.apiKey}`,
          },
          body: JSON.stringify({
            model: opts.model,
            max_completion_tokens: req.maxTokens,
            messages: [{ role: 'system', content: req.system }, ...req.messages],
          }),
          signal: req.signal,
        });
      } catch (err) {
        if (req.signal.aborted) throw new ModelError('aborted', 'abgebrochen');
        throw new ModelError(
          'network',
          `Keine Verbindung zu OpenAI (${err instanceof Error ? err.message : String(err)}).`,
        );
      }

      const bodyText = await res.text();
      if (!res.ok) {
        throw new ModelError(
          'http',
          `OpenAI meldet einen Fehler (${res.status}): ${extractApiError(bodyText)}`,
          res.status,
        );
      }

      let body: {
        choices?: { message?: { content?: string | null } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      try {
        body = JSON.parse(bodyText);
      } catch {
        throw new ModelError('http', 'OpenAI hat etwas Unlesbares geschickt.', res.status);
      }

      const text = (body.choices?.[0]?.message?.content ?? '').trim();
      if (!text) throw new ModelError('empty', 'ChatGPT hat eine leere Antwort geschickt.');

      const input = body.usage?.prompt_tokens;
      const output = body.usage?.completion_tokens;
      return {
        text,
        inputTokens: input ?? 0,
        outputTokens: output ?? 0,
        usageKnown: typeof input === 'number' && typeof output === 'number',
      };
    },
  };
}
