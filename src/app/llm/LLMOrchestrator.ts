/**
 * ORIENT - LLM Orchestrator
 * 
 * Hier sitzt die DNA-Logik: OFF by default, Redaction, keine Autonomie.
 * 
 * Respektiert ORIENT_DNA:
 * - OFF by default
 * - Redaction vor Send
 * - Keine Autonomie (nur Vorschläge)
 * - Transparenz (labelOutputsAsSuggestion)
 */

import { LLMClient } from '@core/llm/LLMClient';
import { LLMPolicy, LLMMode } from '@core/llm/LLMPolicy';
import { LLMTaskInput, LLMTaskOutput } from '@core/llm/LLMTypes';

/**
 * Einfache Redaction (Phase 1)
 * Später: bessere Regeln (emails, phone, addresses, names)
 */
const redact = (text: string): string => {
  // Phase 1: simple placeholder redaction
  // später: bessere Regeln (emails, phone, addresses, names)
  return text.replace(/\b\d{6,}\b/g, '[REDACTED]');
};

export class LLMOrchestrator {
  constructor(
    private client: LLMClient,
    private policy: LLMPolicy,
  ) {}

  /**
   * Führt einen LLM-Task aus
   * DNA: OFF by default, Redaction, keine Autonomie
   */
  async run(task: LLMTaskInput): Promise<LLMTaskOutput> {
    if (this.policy.mode === LLMMode.OFF) {
      return {
        ok: false,
        notes: 'LLM is OFF (policy).',
      };
    }

    let text = task.text;

    // Redaction vor Send (DNA: Privacy)
    if (this.policy.redactBeforeSend) {
      text = redact(text);
    }

    // Keine Autonomie: nur Vorschläge
    const out = await this.client.run({ ...task, text });

    // Label Outputs als Vorschlag (DNA: Transparenz)
    if (this.policy.labelOutputsAsSuggestion && out.suggestion) {
      return {
        ...out,
        suggestion: `Vorschlag (LLM):\n${out.suggestion}`,
      };
    }

    return out;
  }
}
