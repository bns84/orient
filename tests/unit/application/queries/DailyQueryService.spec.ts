/**
 * ORIENT - Daily Query Service Tests
 * 
 * Tests für Daily-Query-Service.
 * Respektiert ORIENT_DNA: Keine Endlosfeeds, 1–3 Items.
 */

import { describe, it, expect } from 'vitest';
import { DailyQueryService } from '@app/queries/DailyQueryService';
import { ContextMode } from '@core/escalation/ContextMode';
import { ThreadStatus } from '@core/threads/ThreadStatus';
import { EscalationLevel } from '@core/escalation/EscalationLevel';

describe('DailyQueryService', () => {
  it('returns 1–3 items, not a feed', async () => {
    const threadRepo: any = {
      findAll: async () => ([
        { id: 't1', status: ThreadStatus.ACTIVE },
        { id: 't2', status: ThreadStatus.DORMANT },
        { id: 't3', status: ThreadStatus.CLOSED },
      ]),
    };

    const threadQuery: any = {
      getThreadSnapshot: async (id: string) => ({
        threadId: id,
        title: id,
        status: id === 't2' ? ThreadStatus.DORMANT : ThreadStatus.ACTIVE,
        tone: 'NORMAL' as const,
        escalation: { level: EscalationLevel.NOTE, score: 0.4, reason: 'ok' },
        summary: 'x',
        highlights: [],
        uncertainties: [],
        provenance: { impulseCount: 0, edgeCount: 0 },
      }),
    };

    const svc = new DailyQueryService(threadRepo, threadQuery);

    const view = await svc.getDailyView({
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(view.items.length).toBeLessThanOrEqual(3);
    expect(view.items.length).toBeGreaterThanOrEqual(1);
    expect(view.date).toBeDefined();
  });

  it('filters out CLOSED threads', async () => {
    const threadRepo: any = {
      findAll: async () => ([
        { id: 't1', status: ThreadStatus.ACTIVE },
        { id: 't2', status: ThreadStatus.CLOSED },
      ]),
    };

    const threadQuery: any = {
      getThreadSnapshot: async (id: string) => {
        if (id === 't2') return null; // CLOSED wird gefiltert
        return {
          threadId: id,
          title: id,
          status: ThreadStatus.ACTIVE,
          tone: 'NORMAL' as const,
          escalation: { level: EscalationLevel.NOTE, score: 0.4, reason: 'ok' },
          summary: 'x',
          highlights: [],
          uncertainties: [],
          provenance: { impulseCount: 0, edgeCount: 0 },
        };
      },
    };

    const svc = new DailyQueryService(threadRepo, threadQuery);

    const view = await svc.getDailyView({
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(view.items.length).toBe(1);
    expect(view.items[0].threadId).toBe('t1');
  });

  it('adds note in QUIET context', async () => {
    const threadRepo: any = {
      findAll: async () => ([]),
    };

    const threadQuery: any = {
      getThreadSnapshot: async () => null,
    };

    const svc = new DailyQueryService(threadRepo, threadQuery);

    const view = await svc.getDailyView({
      contextMode: ContextMode.QUIET,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    expect(view.note).toBe('Ruhemodus aktiv.');
  });

  it('sorts by priority score', async () => {
    const threadRepo: any = {
      findAll: async () => ([
        { id: 't1', status: ThreadStatus.ACTIVE },
        { id: 't2', status: ThreadStatus.ACTIVE },
        { id: 't3', status: ThreadStatus.ACTIVE },
      ]),
    };

    const threadQuery: any = {
      getThreadSnapshot: async (id: string) => {
        const scores: Record<string, { level: EscalationLevel; score: number }> = {
          t1: { level: EscalationLevel.NOTE, score: 0.3 },
          t2: { level: EscalationLevel.FRAME, score: 0.8 },
          t3: { level: EscalationLevel.HINT, score: 0.5 },
        };

        return {
          threadId: id,
          title: id,
          status: ThreadStatus.ACTIVE,
          tone: 'NORMAL' as const,
          escalation: { ...scores[id], reason: 'ok' },
          summary: 'x',
          highlights: [],
          uncertainties: [],
          provenance: { impulseCount: 0, edgeCount: 0 },
        };
      },
    };

    const svc = new DailyQueryService(threadRepo, threadQuery);

    const view = await svc.getDailyView({
      contextMode: ContextMode.NORMAL,
      allowHints: true,
      hintBudgetRemaining: 10,
    });

    // t2 (FRAME) sollte zuerst kommen, dann t3 (HINT), dann t1 (NOTE)
    expect(view.items[0].threadId).toBe('t2');
    expect(view.items[1].threadId).toBe('t3');
    expect(view.items[2].threadId).toBe('t1');
  });
});
