/**
 * Ersatz-Modell für Tests und für „ORIENT_MODEL=mock“ (läuft ohne Schlüssel, kostet nichts).
 */

import {
  ModelError,
  type ModelClient,
  type ModelRequest,
  type ModelResponse,
} from './types.js';

export interface MockOptions {
  delayMs?: number;
  reply?: (req: ModelRequest) => string;
  failWith?: ModelError;
  /** false = keine Tokenzahlen liefern */
  reportUsage?: boolean;
}

export class MockModel implements ModelClient {
  readonly id = 'mock' as const;
  readonly label = 'Ersatz-Modell';
  readonly model = 'mock-1';
  readonly ready = true;
  readonly prices = { inputPerMillion: 2, outputPerMillion: 10 };
  readonly requests: ModelRequest[] = [];

  constructor(private readonly opts: MockOptions = {}) {}

  async complete(req: ModelRequest): Promise<ModelResponse> {
    this.requests.push(req);

    if (this.opts.delayMs) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, this.opts.delayMs);
        req.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new ModelError('aborted', 'abgebrochen'));
          },
          { once: true },
        );
      });
    }
    if (req.signal.aborted) throw new ModelError('aborted', 'abgebrochen');
    if (this.opts.failWith) throw this.opts.failWith;

    const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const text = this.opts.reply ? this.opts.reply(req) : `Ersatz-Antwort auf: ${lastUser}`;
    const inChars = req.system.length + req.messages.reduce((n, m) => n + m.content.length, 0);
    const report = this.opts.reportUsage !== false;
    return {
      text,
      inputTokens: report ? Math.ceil(inChars / 4) : 0,
      outputTokens: report ? Math.ceil(text.length / 4) : 0,
      usageKnown: report,
    };
  }
}
