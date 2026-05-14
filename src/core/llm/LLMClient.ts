/**
 * ORIENT - LLM Client Interface
 * 
 * Abstraktion für LLM-Clients.
 * Respektiert ORIENT_DNA: Austauschbarkeit, keine Vendor-Lock-in.
 */

import { LLMTaskInput, LLMTaskOutput } from './LLMTypes';

export interface LLMClient {
  /**
   * Führt einen LLM-Task aus
   * DNA: Nur Vorschläge, keine Entscheidungen
   */
  run(task: LLMTaskInput): Promise<LLMTaskOutput>;
}
