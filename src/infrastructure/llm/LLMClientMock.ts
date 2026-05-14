/**
 * ORIENT - LLM Client Mock
 * 
 * Deterministischer Mock für Tests und Development.
 * Respektiert ORIENT_DNA: Transparenz, keine Blackbox.
 */

import { LLMClient } from '@core/llm/LLMClient';
import { LLMTaskInput, LLMTaskOutput } from '@core/llm/LLMTypes';

export class LLMClientMock implements LLMClient {
  /**
   * Deterministischer Mock
   * DNA: Keine Zufälligkeit, nachvollziehbar
   */
  async run(task: LLMTaskInput): Promise<LLMTaskOutput> {
    // deterministic mock
    if (task.type === 'THREAD_SUMMARY') {
      return {
        ok: true,
        suggestion: `Kurzfassung: ${task.text.slice(0, 120)}…`,
        notes: 'Mock summary.',
      };
    }
    if (task.type === 'EXPORT_MARKDOWN_POLISH') {
      return {
        ok: true,
        suggestion: task.text,
        notes: 'Mock passthrough.',
      };
    }
    if (task.type === 'THREAD_TITLE_SUGGESTION') {
      return {
        ok: true,
        suggestion: task.text.slice(0, 60),
        notes: 'Mock title suggestion.',
      };
    }
    if (task.type === 'ENTITY_SUGGESTION') {
      return {
        ok: true,
        suggestion: task.text.slice(0, 60),
        notes: 'Mock entity suggestion.',
      };
    }
    return {
      ok: true,
      suggestion: task.text.slice(0, 60),
      notes: 'Mock suggestion.',
    };
  }
}
