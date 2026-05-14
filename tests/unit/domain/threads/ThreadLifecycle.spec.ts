/**
 * ORIENT - Thread Lifecycle Tests
 * 
 * Tests für Thread-Lifecycle-Engine.
 * Respektiert ORIENT_DNA: Kein Erzwingen, kein Auto-Löschen.
 */

import { describe, it, expect } from 'vitest';
import { ThreadLifecycle } from '@core/threads/ThreadLifecycle';
import { ThreadStatus } from '@core/threads/ThreadStatus';
import { Thread } from '@core/threads/Thread';

const baseThread = (): Thread => ({
  id: 't1',
  title: 'Test Thread',
  status: ThreadStatus.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  metrics: {
    recencyScore: 0.5,
    frequencyScore: 0.5,
    confidenceScore: 0.5,
    userRelevanceScore: 0.5,
  },
});

describe('ThreadLifecycle', () => {
  describe('activate', () => {
    it('aktiviert einen ACTIVE Thread (bleibt ACTIVE)', () => {
      const thread = baseThread();
      const result = ThreadLifecycle.activate(thread);
      expect(result.status).toBe(ThreadStatus.ACTIVE);
      expect(result.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());
    });

    it('aktiviert einen OBSERVED Thread', () => {
      const thread = { ...baseThread(), status: ThreadStatus.OBSERVED };
      const result = ThreadLifecycle.activate(thread);
      expect(result.status).toBe(ThreadStatus.ACTIVE);
    });

    it('aktiviert einen DORMANT Thread', () => {
      const thread = { ...baseThread(), status: ThreadStatus.DORMANT };
      const result = ThreadLifecycle.activate(thread);
      expect(result.status).toBe(ThreadStatus.ACTIVE);
    });

    it('erzwingt keine Aktivierung von CLOSED Threads (DNA: kein Erzwingen)', () => {
      const thread = { ...baseThread(), status: ThreadStatus.CLOSED };
      const result = ThreadLifecycle.activate(thread);
      expect(result.status).toBe(ThreadStatus.CLOSED);
      expect(result).toBe(thread); // Unverändert
    });
  });

  describe('markObserved', () => {
    it('markiert ACTIVE Thread als OBSERVED', () => {
      const thread = baseThread();
      const result = ThreadLifecycle.markObserved(thread);
      expect(result.status).toBe(ThreadStatus.OBSERVED);
      expect(result.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());
    });

    it('erzwingt keine OBSERVED-Markierung von DORMANT Threads', () => {
      const thread = { ...baseThread(), status: ThreadStatus.DORMANT };
      const result = ThreadLifecycle.markObserved(thread);
      expect(result.status).toBe(ThreadStatus.DORMANT);
      expect(result).toBe(thread); // Unverändert
    });
  });

  describe('markDormant', () => {
    it('markiert ACTIVE Thread als DORMANT (DNA: nicht gelöscht)', () => {
      const thread = baseThread();
      const result = ThreadLifecycle.markDormant(thread);
      expect(result.status).toBe(ThreadStatus.DORMANT);
      expect(result.id).toBe(thread.id); // Thread existiert noch
      expect(result.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());
    });

    it('markiert OBSERVED Thread als DORMANT', () => {
      const thread = { ...baseThread(), status: ThreadStatus.OBSERVED };
      const result = ThreadLifecycle.markDormant(thread);
      expect(result.status).toBe(ThreadStatus.DORMANT);
    });

    it('erzwingt keine DORMANT-Markierung von CLOSED Threads', () => {
      const thread = { ...baseThread(), status: ThreadStatus.CLOSED };
      const result = ThreadLifecycle.markDormant(thread);
      expect(result.status).toBe(ThreadStatus.CLOSED);
      expect(result).toBe(thread); // Unverändert
    });
  });

  describe('reactivate', () => {
    it('reaktiviert DORMANT Thread zu ACTIVE (DNA: explizite Reaktivierung)', () => {
      const thread = { ...baseThread(), status: ThreadStatus.DORMANT };
      const result = ThreadLifecycle.reactivate(thread);
      expect(result.status).toBe(ThreadStatus.ACTIVE);
      expect(result.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());
    });

    it('erzwingt keine Reaktivierung von ACTIVE Threads', () => {
      const thread = baseThread();
      const result = ThreadLifecycle.reactivate(thread);
      expect(result.status).toBe(ThreadStatus.ACTIVE);
      expect(result).toBe(thread); // Unverändert (bereits ACTIVE)
    });

    it('erzwingt keine Reaktivierung von CLOSED Threads', () => {
      const thread = { ...baseThread(), status: ThreadStatus.CLOSED };
      const result = ThreadLifecycle.reactivate(thread);
      expect(result.status).toBe(ThreadStatus.CLOSED);
      expect(result).toBe(thread); // Unverändert
    });
  });

  describe('close', () => {
    it('schließt einen Thread (DNA: CLOSED bedeutet nicht gelöscht)', () => {
      const thread = baseThread();
      const result = ThreadLifecycle.close(thread);
      expect(result.status).toBe(ThreadStatus.CLOSED);
      expect(result.id).toBe(thread.id); // Thread existiert noch
      expect(result.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());
    });

    it('kann jeden Thread schließen', () => {
      const dormant = { ...baseThread(), status: ThreadStatus.DORMANT };
      const result = ThreadLifecycle.close(dormant);
      expect(result.status).toBe(ThreadStatus.CLOSED);
    });
  });

  describe('canTransition', () => {
    it('erlaubt ACTIVE → OBSERVED', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.ACTIVE, ThreadStatus.OBSERVED)).toBe(true);
    });

    it('erlaubt ACTIVE → DORMANT', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.ACTIVE, ThreadStatus.DORMANT)).toBe(true);
    });

    it('erlaubt DORMANT → ACTIVE (Reaktivierung)', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.DORMANT, ThreadStatus.ACTIVE)).toBe(true);
    });

    it('verbietet DORMANT → OBSERVED (nur Reaktivierung zu ACTIVE)', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.DORMANT, ThreadStatus.OBSERVED)).toBe(false);
    });

    it('verbietet CLOSED → ACTIVE (Endzustand)', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.CLOSED, ThreadStatus.ACTIVE)).toBe(false);
    });

    it('erlaubt CLOSED → CLOSED (bleibt CLOSED)', () => {
      expect(ThreadLifecycle.canTransition(ThreadStatus.CLOSED, ThreadStatus.CLOSED)).toBe(true);
    });
  });

  describe('DNA-Konformität', () => {
    it('Thread wird nie gelöscht, nur DORMANT (DNA: keine automatische Löschung)', () => {
      const thread = baseThread();
      const dormant = ThreadLifecycle.markDormant(thread);
      expect(dormant.id).toBe(thread.id);
      expect(dormant.status).toBe(ThreadStatus.DORMANT);
      // Thread existiert noch - nicht gelöscht
    });

    it('kein Erzwingen von Status-Übergängen (DNA: Ruhe vor Geschwindigkeit)', () => {
      const closed = { ...baseThread(), status: ThreadStatus.CLOSED };
      const result = ThreadLifecycle.activate(closed);
      expect(result.status).toBe(ThreadStatus.CLOSED); // Unverändert
    });

    it('Reaktivierung nur explizit (DNA: keine automatische Reaktivierung)', () => {
      const dormant = { ...baseThread(), status: ThreadStatus.DORMANT };
      const result = ThreadLifecycle.reactivate(dormant);
      expect(result.status).toBe(ThreadStatus.ACTIVE); // Explizite Reaktivierung
    });
  });
});
