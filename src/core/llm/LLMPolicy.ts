/**
 * ORIENT - LLM Policy
 * 
 * Policy für LLM-Nutzung.
 * Respektiert ORIENT_DNA: OFF by default, keine Autonomie, Privacy.
 */

export enum LLMMode {
  OFF = 'OFF',           // default
  LOCAL = 'LOCAL',       // später: on-device model
  REMOTE = 'REMOTE',     // z.B. OpenAI, etc.
}

export interface LLMPolicy {
  mode: LLMMode;

  // Ruhe / Safety
  allowAutoActions: false;        // immer false in Phase 1
  allowBackgroundCalls: boolean;  // default false
  maxTokensHint: number;

  // Privacy
  allowSendPersonalData: boolean; // default false
  redactBeforeSend: boolean;      // default true

  // UX
  labelOutputsAsSuggestion: boolean; // true
}

/**
 * Default-Policy (empfohlen):
 * - OFF
 * - keine Background Calls
 * - Redaction an
 * - keine persönlichen Daten raus
 */
export const DEFAULT_LLM_POLICY: LLMPolicy = {
  mode: LLMMode.OFF,
  allowAutoActions: false,
  allowBackgroundCalls: false,
  maxTokensHint: 400,
  allowSendPersonalData: false,
  redactBeforeSend: true,
  labelOutputsAsSuggestion: true,
};
