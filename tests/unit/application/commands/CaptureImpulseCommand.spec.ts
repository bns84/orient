/**
 * ORIENT - Capture Impulse Command Tests
 * 
 * Tests für Capture-Impulse-Command.
 * Respektiert ORIENT_DNA: Keine Bewertung, nur festhalten.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../src/db/interest', () => ({
  recordTopicEngagement: vi.fn(async () => 0),
}));
import { CaptureImpulseCommand } from '@app/commands/CaptureImpulseCommand';
import { ContextMode } from '@core/escalation/ContextMode';
import { ImpulseState } from '@core/impulses/ImpulseState';

describe('CaptureImpulseCommand', () => {
  it('stores a raw impulse from text', async () => {
    let savedImpulse: any = null;
    const repo: any = {
      save: async (impulse: any) => {
        savedImpulse = impulse;
      },
    };

    const cmd = new CaptureImpulseCommand(repo);

    const res = await cmd.execute(
      { text: 'Idee für Origami-Schwäne' },
      { contextMode: ContextMode.NORMAL },
    );

    expect(res.ok).toBe(true);
    expect(savedImpulse).toBeDefined();
    expect(savedImpulse.content.text).toBe('Idee für Origami-Schwäne');
    expect(savedImpulse.state).toBe(ImpulseState.DUST);
    expect(res.message).toBe('Gedanke gespeichert.');
  });

  it('stores a raw impulse from transcript', async () => {
    let savedImpulse: any = null;
    const repo: any = {
      save: async (impulse: any) => {
        savedImpulse = impulse;
      },
    };

    const cmd = new CaptureImpulseCommand(repo);

    const res = await cmd.execute(
      { transcript: 'Voice input test' },
      { contextMode: ContextMode.NORMAL },
    );

    expect(res.ok).toBe(true);
    expect(savedImpulse.content.transcript).toBe('Voice input test');
  });

  it('links impulse to thread if threadId provided', async () => {
    let savedImpulse: any = null;
    const repo: any = {
      save: async (impulse: any) => {
        savedImpulse = impulse;
      },
    };

    const cmd = new CaptureImpulseCommand(repo);

    const res = await cmd.execute(
      { text: 'Test', threadId: 't1' },
      { contextMode: ContextMode.NORMAL },
    );

    expect(res.ok).toBe(true);
    expect(savedImpulse.links.threadIds).toContain('t1');
  });

  it('rejects empty input', async () => {
    const repo: any = {
      save: async () => {},
    };

    const cmd = new CaptureImpulseCommand(repo);

    const res = await cmd.execute(
      {},
      { contextMode: ContextMode.NORMAL },
    );

    expect(res.ok).toBe(false);
    expect(res.message).toBe('Kein Inhalt übergeben.');
  });

  describe('DNA-Konformität', () => {
    it('does not evaluate - only captures (DNA: keine Bewertung)', async () => {
      let savedImpulse: any = null;
      const repo: any = {
        save: async (impulse: any) => {
          savedImpulse = impulse;
        },
      };

      const cmd = new CaptureImpulseCommand(repo);

      await cmd.execute(
        { text: 'Rohe, unfertige Idee' },
        { contextMode: ContextMode.NORMAL },
      );

      // Impulse bleibt roh, keine Auto-Bewertung
      expect(savedImpulse.state).toBe(ImpulseState.DUST);
      expect(savedImpulse.meta.importanceHint).toBeUndefined();
    });

    it('gives quiet feedback (DNA: Ruhe vor Geschwindigkeit)', async () => {
      const repo: any = {
        save: async () => {},
      };

      const cmd = new CaptureImpulseCommand(repo);

      const res = await cmd.execute(
        { text: 'Test' },
        { contextMode: ContextMode.NORMAL },
      );

      expect(res.message).toBe('Gedanke gespeichert.'); // Ruhig, nicht übertrieben
    });
  });
});
