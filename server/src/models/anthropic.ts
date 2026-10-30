/**
 * Anschluss Claude (Anthropic Messages API).
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

export interface AnthropicOptions {
  apiKey: string;
  model: string;
  prices: Prices;
  /** Nur für Tests */
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

export function createAnthropicClient(opts: AnthropicOptions): ModelClient {
  const endpoint = opts.endpoint ?? 'https://api.anthropic.com/v1/messages';
  const doFetch = opts.fetchImpl ?? fetch;

  return {
    id: 'anthropic',
    label: 'Claude',
    model: opts.model,
    ready: Boolean(opts.apiKey),
    prices: opts.prices,

    async complete(req: ModelRequest): Promise<ModelResponse> {
      if (!opts.apiKey) {
        throw new ModelError(
          'no_key',
          'Es fehlt der Anthropic-Schlüssel. Er gehört in die Datei server\\.env hinter ANTHROPIC_API_KEY=.',
        );
      }

      let res: Response;
      try {
        res = await doFetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': opts.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: opts.model,
            max_tokens: req.maxTokens,
            system: req.system,
            messages: req.messages,
          }),
          signal: req.signal,
        });
      } catch (err) {
        if (req.signal.aborted) throw new ModelError('aborted', 'abgebrochen');
        throw new ModelError(
          'network',
          `Keine Verbindung zu Anthropic (${err instanceof Error ? err.message : String(err)}).`,
        );
      }

      const bodyText = await res.text();
      if (!res.ok) {
        throw new ModelError(
          'http',
          `Anthropic meldet einen Fehler (${res.status}): ${extractApiError(bodyText)}`,
          res.status,
        );
      }

      let body: {
        content?: { type?: string; text?: string }[];
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      try {
        body = JSON.parse(bodyText);
      } catch {
        throw new ModelError('http', 'Anthropic hat etwas Unlesbares geschickt.', res.status);
      }

      const text = (body.content ?? [])
        .filter((c) => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text as string)
        .join('')
        .trim();
      if (!text) throw new ModelError('empty', 'Claude hat eine leere Antwort geschickt.');

      const input = body.usage?.input_tokens;
      const output = body.usage?.output_tokens;
      return {
        text,
        inputTokens: input ?? 0,
        outputTokens: output ?? 0,
        usageKnown: typeof input === 'number' && typeof output === 'number',
      };
    },
  };
}
