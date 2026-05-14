/**
 * ORIENT - LLM Orchestrator Tests
 * 
 * Tests für LLM-Orchestrator.
 * Respektiert ORIENT_DNA: OFF by default, Redaction, keine Autonomie.
 */

import { describe, it, expect } from 'vitest';
import { LLMOrchestrator } from '@app/llm/LLMOrchestrator';
import { LLMClientMock } from '@infrastructure/llm/LLMClientMock';
import { LLMMode, DEFAULT_LLM_POLICY } from '@core/llm/LLMPolicy';

describe('LLMOrchestrator', () => {
  it('is OFF by default', async () => {
    const orch = new LLMOrchestrator(new LLMClientMock(), DEFAULT_LLM_POLICY);

    const out = await orch.run({
      type: 'THREAD_SUMMARY',
      text: 'Test',
    });

    expect(out.ok).toBe(false);
    expect(out.notes).toBe('LLM is OFF (policy).');
  });

  it('returns suggestion when enabled', async () => {
    const orch = new LLMOrchestrator(new LLMClientMock(), {
      ...DEFAULT_LLM_POLICY,
      mode: LLMMode.LOCAL,
    });

    const out = await orch.run({
      type: 'THREAD_SUMMARY',
      text: 'Hallo Welt',
    });

    expect(out.ok).toBe(true);
    expect(out.suggestion?.startsWith('Vorschlag (LLM):')).toBe(true);
  });

  it('redacts sensitive data before sending', async () => {
    const orch = new LLMOrchestrator(new LLMClientMock(), {
      ...DEFAULT_LLM_POLICY,
      mode: LLMMode.LOCAL,
      redactBeforeSend: true,
    });

    const out = await orch.run({
      type: 'THREAD_SUMMARY',
      text: 'Meine Telefonnummer ist 1234567890',
    });

    expect(out.ok).toBe(true);
    // Mock sollte redacted text erhalten haben
    expect(out.notes).toBe('Mock summary.');
  });

  it('labels outputs as suggestion', async () => {
    const orch = new LLMOrchestrator(new LLMClientMock(), {
      ...DEFAULT_LLM_POLICY,
      mode: LLMMode.LOCAL,
      labelOutputsAsSuggestion: true,
    });

    const out = await orch.run({
      type: 'THREAD_TITLE_SUGGESTION',
      text: 'Test',
    });

    expect(out.ok).toBe(true);
    expect(out.suggestion?.startsWith('Vorschlag (LLM):')).toBe(true);
  });

  it('can disable suggestion labeling', async () => {
    const orch = new LLMOrchestrator(new LLMClientMock(), {
      ...DEFAULT_LLM_POLICY,
      mode: LLMMode.LOCAL,
      labelOutputsAsSuggestion: false,
    });

    const out = await orch.run({
      type: 'THREAD_SUMMARY',
      text: 'Test',
    });

    expect(out.ok).toBe(true);
    expect(out.suggestion?.startsWith('Vorschlag (LLM):')).toBe(false);
  });

  describe('DNA-Konformität', () => {
    it('OFF by default (DNA: Ruhe vor Geschwindigkeit)', () => {
      const policy = DEFAULT_LLM_POLICY;
      expect(policy.mode).toBe(LLMMode.OFF);
    });

    it('no auto actions (DNA: keine Autonomie)', () => {
      const policy = DEFAULT_LLM_POLICY;
      expect(policy.allowAutoActions).toBe(false);
    });

    it('redaction enabled by default (DNA: Privacy)', () => {
      const policy = DEFAULT_LLM_POLICY;
      expect(policy.redactBeforeSend).toBe(true);
    });

    it('no personal data by default (DNA: Privacy)', () => {
      const policy = DEFAULT_LLM_POLICY;
      expect(policy.allowSendPersonalData).toBe(false);
    });

    it('labels outputs as suggestion (DNA: Transparenz)', () => {
      const policy = DEFAULT_LLM_POLICY;
      expect(policy.labelOutputsAsSuggestion).toBe(true);
    });
  });
});
