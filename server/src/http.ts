/**
 * Die Haustür des Pförtners. Hört nur auf diesem Rechner (127.0.0.1) und nur auf
 * Anfragen von der eigenen App (Herkunft wird geprüft), damit keine fremde Webseite
 * im Hintergrund Geld verbrauchen kann.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { Orient } from './orient.js';
import type { Source } from './tree/types.js';
import type { ChatMessage } from './models/types.js';
import { effectiveDailyLimit, spentToday } from './tree/stations.js';

const MAX_BODY_BYTES = 1_000_000;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Anfrage zu groß'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const text = await readBody(req);
  if (!text.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fällt unten durch
  }
  throw new HttpError(400, 'Das war kein gültiges JSON.');
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => (p && typeof p === 'object' && typeof (p as { text?: unknown }).text === 'string' ? (p as { text: string }).text : ''))
      .join('');
  }
  return '';
}

export function createHttpServer(orient: Orient): Server {
  const { config } = orient;

  function send(res: ServerResponse, status: number, body: unknown, origin: string | null): void {
    const headers: Record<string, string> = { 'content-type': 'application/json; charset=utf-8' };
    if (origin) {
      headers['access-control-allow-origin'] = origin;
      headers.vary = 'Origin';
    }
    res.writeHead(status, headers);
    res.end(JSON.stringify(body));
  }

  async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : null;
    const originAllowed = origin !== null && config.allowedOrigins.includes(origin);

    // Fremde Webseiten bleiben draußen. Aufrufe ohne Herkunft (zum Beispiel Testwerkzeuge) sind erlaubt.
    if (origin !== null && !originAllowed) {
      send(res, 403, { error: 'Diese Herkunft ist nicht erlaubt.' }, null);
      return;
    }
    const echoOrigin = originAllowed ? origin : null;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': echoOrigin ?? '',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type, authorization',
        'access-control-max-age': '600',
        vary: 'Origin',
      });
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (req.method === 'GET' && path === '/api/health') {
      send(
        res,
        200,
        {
          ok: true,
          model: {
            id: orient.model.id,
            label: orient.model.label,
            name: orient.model.model,
            ready: orient.model.ready,
          },
          todayCostUsd: spentToday(orient.deps, config.userId, orient.clock()),
          dailyLimitUsd: effectiveDailyLimit(orient.deps, config.userId),
        },
        echoOrigin,
      );
      return;
    }

    if (req.method === 'GET' && path === '/api/usage') {
      send(
        res,
        200,
        {
          todayCostUsd: spentToday(orient.deps, config.userId, orient.clock()),
          dailyLimitUsd: effectiveDailyLimit(orient.deps, config.userId),
          recent: orient.brain.recentRequests(config.userId, 20),
        },
        echoOrigin,
      );
      return;
    }

    if (req.method === 'GET' && path === '/api/rules') {
      const now = orient.clock().getTime();
      const rules = orient.brain.listRules(config.userId).map((r) => ({
        ...r,
        state: !r.active
          ? 'ausgeschaltet'
          : r.validUntil !== null && r.validUntil <= now
            ? 'abgelaufen'
            : 'gilt',
      }));
      send(res, 200, { rules }, echoOrigin);
      return;
    }

    if (req.method === 'POST' && path === '/api/ask') {
      const body = await readJson(req);
      const text = typeof body.text === 'string' ? body.text : '';
      const source: Source = body.source === 'voice' ? 'voice' : 'text';
      const result = await orient.ask({
        text,
        source,
        requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
        companionName: typeof body.companionName === 'string' ? body.companionName : undefined,
      });
      send(res, 200, result, echoOrigin);
      return;
    }

    if (req.method === 'POST' && path === '/api/cancel') {
      const body = await readJson(req);
      const requestId = typeof body.requestId === 'string' ? body.requestId : '';
      send(res, 200, { cancelled: requestId ? orient.cancel(requestId) : false }, echoOrigin);
      return;
    }

    // OpenAI-kompatible Einzelaufgaben für die App (kein Schlüssel im Browser nötig)
    if (req.method === 'POST' && (path === '/v1/chat/completions' || path === '/chat/completions')) {
      const body = await readJson(req);
      const raw = Array.isArray(body.messages) ? (body.messages as { role?: unknown; content?: unknown }[]) : [];
      const system = raw
        .filter((m) => m.role === 'system')
        .map((m) => contentToText(m.content))
        .join('\n\n');
      const messages: ChatMessage[] = raw
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: contentToText(m.content) }))
        .filter((m) => m.content.trim() !== '');

      if (messages.length === 0) {
        send(res, 400, { error: { message: 'Keine Nachricht enthalten.' } }, echoOrigin);
        return;
      }

      const out = await orient.task({
        system,
        messages,
        maxTokens: typeof body.max_tokens === 'number' ? body.max_tokens : undefined,
      });
      if (!out.ok) {
        send(res, out.reason === 'limit' ? 429 : 502, { error: { message: out.message } }, echoOrigin);
        return;
      }
      send(
        res,
        200,
        {
          id: 'orient-task',
          object: 'chat.completion',
          model: orient.model.model,
          choices: [
            { index: 0, message: { role: 'assistant', content: out.text }, finish_reason: 'stop' },
          ],
          usage: {
            prompt_tokens: out.inputTokens,
            completion_tokens: out.outputTokens,
            total_tokens: out.inputTokens + out.outputTokens,
          },
        },
        echoOrigin,
      );
      return;
    }

    send(res, 404, { error: 'Das kenne ich nicht.' }, echoOrigin);
  }

  return createServer((req, res) => {
    route(req, res).catch((err: unknown) => {
      const status = err instanceof HttpError ? err.status : 500;
      const message = err instanceof Error ? err.message : String(err);
      if (!res.headersSent) {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: message }));
    });
  });
}
