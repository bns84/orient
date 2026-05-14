/**
 * ORIENT - LLM Types
 * 
 * Typen für LLM-Tasks.
 * Respektiert ORIENT_DNA: Nur Vorschläge, keine Entscheidungen.
 */

export type LLMTaskType =
  | 'THREAD_TITLE_SUGGESTION'
  | 'THREAD_SUMMARY'
  | 'EXPORT_MARKDOWN_POLISH'
  | 'ENTITY_SUGGESTION';

export interface LLMTaskInput {
  type: LLMTaskType;
  text: string;
  context?: {
    threadTitle?: string;
    userIntent?: string;
  };
}

export interface LLMTaskOutput {
  ok: boolean;
  suggestion?: string;
  notes?: string; // transparency: "why this suggestion"
}
