/**
 * ORIENT - LLM Client OpenAI (Stub)
 * 
 * Stub für OpenAI-Integration.
 * Echte Implementierung später.
 * 
 * Respektiert ORIENT_DNA:
 * - Privacy (Redaction)
 * - Keine Autonomie
 * - Optional, nicht erforderlich
 */

import { LLMClient } from '@core/llm/LLMClient';
import { LLMTaskInput, LLMTaskOutput } from '@core/llm/LLMTypes';

/**
 * Stub: echte Implementierung später
 */
export class LLMClientOpenAI implements LLMClient {
  async run(_: LLMTaskInput): Promise<LLMTaskOutput> {
    return {
      ok: false,
      notes: 'OpenAI client not configured yet.',
    };
  }
}
