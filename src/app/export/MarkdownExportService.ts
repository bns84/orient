/**
 * ORIENT - Markdown Export Service
 * 
 * Exportiert ThreadSnapshot + Highlights + Unsicherheiten als sauber strukturiertes Markdown.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (saubere Struktur)
 * - Transparenz (Herkunft sichtbar)
 * - Keine Überkomplexität
 */

import { ThreadSnapshot } from '../queries/types/ThreadSnapshot';
import { DailyView } from '../queries/types/DailyView';
import { ExportBundle } from './types/ExportBundle';
import { ExportTarget } from './types/ExportTarget';

export class MarkdownExportService {
  /**
   * Konvertiert ThreadSnapshot zu Markdown
   * DNA: Klar strukturiert, keine Magie
   */
  threadSnapshotToMarkdown(snapshot: ThreadSnapshot): ExportBundle {
    const md = [
      `# ${snapshot.title}`,
      ``,
      `**Status:** ${snapshot.status}`,
      `**Eskalation:** ${snapshot.escalation.level} (${Math.round(snapshot.escalation.score * 100)}%)`,
      `**Warum:** ${snapshot.escalation.reason}`,
      ``,
      `## Zusammenfassung`,
      snapshot.summary || '-',
      ``,
      `## Highlights`,
      snapshot.highlights?.length
        ? snapshot.highlights.map((h) => `- ${h}`).join('\n')
        : `- (keine)`,
      ``,
      `## Unsicherheiten`,
      snapshot.uncertainties?.length
        ? snapshot.uncertainties.map((u) => `- ${u}`).join('\n')
        : `- (keine)`,
      ``,
      `## Herkunft`,
      `- Impulse: ${snapshot.provenance.impulseCount}`,
      `- Verknüpfungen: ${snapshot.provenance.edgeCount}`,
      snapshot.provenance.lastActivityAt
        ? `- Letzte Aktivität: ${new Date(snapshot.provenance.lastActivityAt).toISOString()}`
        : `- Letzte Aktivität: (unbekannt)`,
      ``,
    ].join('\n');

    return {
      target: ExportTarget.MARKDOWN,
      filename: `thread_${snapshot.threadId}.md`,
      content: md.trim(),
      meta: {
        createdAt: new Date(),
        threadId: snapshot.threadId,
      },
    };
  }

  /** Tagesüberblick (1–3 Themen) als Markdown OVERVIEW */
  dailyViewToMarkdown(view: DailyView): ExportBundle {
    const sections = view.items.map((s, idx) => {
      return [
        `## ${idx + 1}. ${s.title}`,
        ``,
        `**Status:** ${s.status}`,
        `**Eskalation:** ${s.escalation.level}`,
        ``,
        s.summary || '_Keine Zusammenfassung_',
        ``,
        s.highlights?.length
          ? s.highlights.map((h) => `- ${h}`).join('\n')
          : '',
      ]
        .filter(Boolean)
        .join('\n');
    });

    const md = [
      `# ORIENT — Überblick (${view.date})`,
      ``,
      view.note ? `_${view.note}_\n` : '',
      sections.length ? sections.join('\n\n') : '_Keine aktiven Themen._',
      ``,
    ].join('\n');

    return {
      target: ExportTarget.MARKDOWN,
      filename: `orient_overview_${view.date}.md`,
      content: md.trim(),
      meta: { createdAt: new Date() },
    };
  }
}
