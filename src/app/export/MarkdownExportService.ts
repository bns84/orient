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
}
