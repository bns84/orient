/**
 * ORIENT - Escalation Engine Tests
 * 
 * Tests für Escalation-Engine und Policy.
 * Respektiert ORIENT_DNA: Ruhe, Zurückhaltung, Kontext-Respekt.
 */

import { describe, it, expect } from 'vitest';
import { EscalationEngine } from '@core/escalation/EscalationEngine';
import { ContextMode } from '@core/escalation/ContextMode';
import { EscalationLevel } from '@core/escalation/EscalationLevel';
import { Signal } from '@core/escalation/Signal';

const base = (overrides: Partial<Signal> = {}): Signal => ({
  threadStatus: 'ACTIVE',
  confidence: 0.5,
  recency: 0.5,
  frequency: 0.2,
  userRelevance: 0.5,
  contextMode: ContextMode.NORMAL,
  allowHints: true,
  hintBudgetRemaining: 10,
  ...overrides,
});

describe('EscalationEngine', () => {
  it('returns OBSERVE for low score', () => {
    const { level } = EscalationEngine.evaluate(
      base({ confidence: 0.1, recency: 0.1, userRelevance: 0.1, frequency: 0.1 }),
    );
    expect(level).toBe(EscalationLevel.OBSERVE);
  });

  it('caps output to NOTE in QUIET context', () => {
    const { level } = EscalationEngine.evaluate(
      base({ contextMode: ContextMode.QUIET, confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.NOTE);
  });

  it('caps output to NOTE in FAMILY context', () => {
    const { level } = EscalationEngine.evaluate(
      base({ contextMode: ContextMode.FAMILY, confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.NOTE);
  });

  it('caps output to NOTE in SOCIAL context', () => {
    const { level } = EscalationEngine.evaluate(
      base({ contextMode: ContextMode.SOCIAL, confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.NOTE);
  });

  it('caps output to NOTE when hints disabled', () => {
    const { level } = EscalationEngine.evaluate(
      base({ allowHints: false, confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.NOTE);
  });

  it('caps output to NOTE when hint budget is empty', () => {
    const { level } = EscalationEngine.evaluate(
      base({ hintBudgetRemaining: 0, confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.NOTE);
  });

  it('returns OBSERVE for CLOSED threads regardless of score', () => {
    const { level } = EscalationEngine.evaluate(
      base({ threadStatus: 'CLOSED', confidence: 1, recency: 1, userRelevance: 1 }),
    );
    expect(level).toBe(EscalationLevel.OBSERVE);
  });

  it('keeps DORMANT threads quiet unless strong shift', () => {
    const a = EscalationEngine.evaluate(
      base({
        threadStatus: 'DORMANT',
        confidence: 1,
        recency: 1,
        userRelevance: 1,
        shift: { strength: 0.3 },
      }),
    );
    expect(a.level).toBe(EscalationLevel.NOTE);

    const b = EscalationEngine.evaluate(
      base({
        threadStatus: 'DORMANT',
        confidence: 1,
        recency: 1,
        userRelevance: 1,
        shift: { strength: 0.9 },
      }),
    );
    expect(b.level).toBe(EscalationLevel.HINT);
  });

  it('allows FRAME in NORMAL context with high score', () => {
    const { level } = EscalationEngine.evaluate(
      base({
        contextMode: ContextMode.NORMAL,
        confidence: 0.9,
        recency: 0.9,
        userRelevance: 0.9,
        frequency: 0.9,
      }),
    );
    expect(level).toBe(EscalationLevel.FRAME);
  });

  it('allows FRAME in FOCUS context with high score', () => {
    const { level } = EscalationEngine.evaluate(
      base({
        contextMode: ContextMode.FOCUS,
        confidence: 0.9,
        recency: 0.9,
        userRelevance: 0.9,
        frequency: 0.9,
      }),
    );
    expect(level).toBe(EscalationLevel.FRAME);
  });

  describe('DNA-Konformität', () => {
    it('respects context mode (DNA: Kontext-Respekt)', () => {
      const quiet = EscalationEngine.evaluate(
        base({ contextMode: ContextMode.QUIET, confidence: 1, recency: 1, userRelevance: 1 }),
      );
      const normal = EscalationEngine.evaluate(
        base({ contextMode: ContextMode.NORMAL, confidence: 1, recency: 1, userRelevance: 1 }),
      );

      expect(quiet.level).toBe(EscalationLevel.NOTE);
      expect(normal.level).toBeGreaterThan(quiet.level); // Normal erlaubt mehr
    });

    it('never escalates CLOSED threads (DNA: kein Erzwingen)', () => {
      const { level } = EscalationEngine.evaluate(
        base({ threadStatus: 'CLOSED', confidence: 1, recency: 1, userRelevance: 1 }),
      );
      expect(level).toBe(EscalationLevel.OBSERVE); // Immer OBSERVE
    });

    it('respects user preferences (DNA: User-Opt-in/Opt-out)', () => {
      const withHints = EscalationEngine.evaluate(
        base({ allowHints: true, confidence: 1, recency: 1, userRelevance: 1 }),
      );
      const withoutHints = EscalationEngine.evaluate(
        base({ allowHints: false, confidence: 1, recency: 1, userRelevance: 1 }),
      );

      expect(withHints.level).toBeGreaterThan(withoutHints.level);
      expect(withoutHints.level).toBe(EscalationLevel.NOTE); // Max NOTE ohne Hints
    });

    it('respects hint budget (DNA: Kontext-Respekt)', () => {
      const withBudget = EscalationEngine.evaluate(
        base({ hintBudgetRemaining: 10, confidence: 1, recency: 1, userRelevance: 1 }),
      );
      const withoutBudget = EscalationEngine.evaluate(
        base({ hintBudgetRemaining: 0, confidence: 1, recency: 1, userRelevance: 1 }),
      );

      expect(withBudget.level).toBeGreaterThan(withoutBudget.level);
      expect(withoutBudget.level).toBe(EscalationLevel.NOTE); // Max NOTE ohne Budget
    });
  });
});
