/**
 * ORIENT - Export Orchestrator
 * 
 * Ein Orchestrator, der Query → Export verkabelt.
 * (So wird das später 1 Button: „Export für Cursor")
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfache Verkabelung)
 * - Transparenz (klare Abhängigkeiten)
 * - Keine Autonomie (nur auf Anfrage)
 */

import { ThreadQueryService, ThreadQueryOptions } from '../queries/ThreadQueryService';
import { DailyQueryService } from '../queries/DailyQueryService';
import { MarkdownExportService } from './MarkdownExportService';
import { CursorPackExportService } from './CursorPackExportService';
import { ExportBundle } from './types/ExportBundle';

export class ExportOrchestrator {
  constructor(
    private threadQuery: ThreadQueryService,
    private dailyQuery: DailyQueryService,
    private md: MarkdownExportService,
    private cursor: CursorPackExportService,
  ) {}

  /**
   * Exportiert Thread als Markdown
   * DNA: Nur auf Anfrage, keine Auto-Exports
   */
  async exportThreadMarkdown(
    threadId: string,
    opts: ThreadQueryOptions,
  ): Promise<ExportBundle | null> {
    const snap = await this.threadQuery.getThreadSnapshot(threadId, opts);
    if (!snap) return null;
    return this.md.threadSnapshotToMarkdown(snap);
  }

  /**
   * Exportiert DailyView als Cursor-Pack
   * DNA: Klar strukturiert, DNA explizit
   */
  async exportDailyCursorPack(opts: ThreadQueryOptions): Promise<ExportBundle> {
    const view = await this.dailyQuery.getDailyView(opts);
    return this.cursor.dailyViewToCursorPack(view);
  }

  async exportDailyMarkdown(opts: ThreadQueryOptions): Promise<ExportBundle> {
    const view = await this.dailyQuery.getDailyView(opts);
    return this.md.dailyViewToMarkdown(view);
  }
}
