/**
 * ORIENT - Export Thread Command
 * 
 * Vorbereitung für Cursor, Markdown, Präsentation.
 * 
 * Respektiert ORIENT_DNA:
 * - Export nur auf expliziten Wunsch
 * - Exporte sind Momentaufnahmen
 */

import { ExportOrchestrator } from '../export/ExportOrchestrator';
import { ThreadQueryOptions } from '../queries/ThreadQueryService';
import { ContextMode } from '@core/escalation/ContextMode';

export interface ExportThreadResult {
  ok: boolean;
  content?: string;
  message?: string;
}

export class ExportThreadCommand {
  constructor(private exportOrch: ExportOrchestrator) {}

  async execute(threadId: string, opts?: Partial<ThreadQueryOptions>): Promise<ExportThreadResult> {
    const queryOpts: ThreadQueryOptions = {
      contextMode: opts?.contextMode ?? ContextMode.NORMAL,
      allowHints: opts?.allowHints ?? true,
      hintBudgetRemaining: opts?.hintBudgetRemaining ?? 99,
    };

    const bundle = await this.exportOrch.exportThreadMarkdown(threadId, queryOpts);

    if (!bundle) {
      return { ok: false, message: 'Thread nicht gefunden.' };
    }

    return { ok: true, content: bundle.content };
  }
}
