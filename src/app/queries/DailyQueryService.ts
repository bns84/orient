/**
 * ORIENT - Daily Query Service
 * 
 * Baut "morgens 1–3 Themen" (kein Feed).
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Keine Endlosfeeds
 * - Stille ist ein Feature
 */

import { ThreadRepository } from '@core/threads/ThreadRepository';
import { ThreadQueryService, ThreadQueryOptions } from './ThreadQueryService';
import { DailyView } from './types/DailyView';
import { dailyPriorityScore } from './helpers/ThreadScoring';
import { ContextMode } from '@core/escalation/ContextMode';
import { ThreadSnapshot } from './types/ThreadSnapshot';

export class DailyQueryService {
  constructor(
    private threadRepo: ThreadRepository,
    private threadQuery: ThreadQueryService,
  ) {}

  async getDailyView(opts: ThreadQueryOptions): Promise<DailyView> {
    const threads = (await this.threadRepo.findAll?.()) || [];

    // Keine Endlosliste: filtere grob vor
    const candidates = threads.filter((t) => t.status !== 'CLOSED');

    const snapshots = (await Promise.all(
      candidates.map((t) => this.threadQuery.getThreadSnapshot(t.id, opts)),
    )).filter(Boolean) as ThreadSnapshot[];

    // sortiere nach Eskalation + Score
    snapshots.sort((a, b) => 
      dailyPriorityScore(b.escalation.level, b.escalation.score) - 
      dailyPriorityScore(a.escalation.level, a.escalation.score)
    );

    const items = snapshots.slice(0, 3);

    const note =
      opts.contextMode === ContextMode.QUIET || 
      opts.contextMode === ContextMode.FAMILY || 
      opts.contextMode === ContextMode.SOCIAL
        ? 'Ruhemodus aktiv.'
        : undefined;

    return {
      date: new Date().toISOString().slice(0, 10),
      items,
      note,
    };
  }
}
