/**
 * ORIENT - Cursor Pack Export Service
 * 
 * Das ist der Copy/Paste-Block für Cursor:
 * - kurz
 * - eindeutig
 * - enthält DNA + konkreten Auftrag
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (inkrementell, testbar)
 * - Transparenz (DNA explizit sichtbar)
 * - Keine Autonomie (klare Aufgaben)
 */

import { DailyView } from '../queries/types/DailyView';
import { ExportBundle } from './types/ExportBundle';
import { ExportTarget } from './types/ExportTarget';

export class CursorPackExportService {
  /**
   * Konvertiert DailyView zu Cursor-Pack
   * DNA: Klar strukturiert, DNA explizit, konkrete Aufgaben
   */
  dailyViewToCursorPack(view: DailyView): ExportBundle {
    const items = view.items
      .map((s, idx) => {
        return [
          `### ${idx + 1}) ${s.title}`,
          `- Status: ${s.status}`,
          `- Eskalation: ${s.escalation.level} (${Math.round(s.escalation.score * 100)}%)`,
          `- Kurz: ${s.summary}`,
          s.highlights?.length
            ? `- Highlights:\n${s.highlights.map((h) => `  - ${h}`).join('\n')}`
            : `- Highlights: (keine)`,
          s.uncertainties?.length
            ? `- Unsicherheiten:\n${s.uncertainties.map((u) => `  - ${u}`).join('\n')}`
            : `- Unsicherheiten: (keine)`,
        ].join('\n');
      })
      .join('\n\n');

    const pack = [
      `# ORIENT — Cursor Pack (${view.date})`,
      ``,
      `## DNA (unverhandelbar)`,
      `- Ruhe vor Geschwindigkeit`,
      `- local-first`,
      `- keine automatische Löschung`,
      `- Stille ist ein Feature`,
      `- keine Engagement-Optimierung / kein Feed`,
      `- LLM ist nur Stimme/Vorschlag, nie Entscheider`,
      ``,
      `## Aufgabe an Cursor`,
      `Implementiere die nächsten Schritte **inkrementell** und **testbar**.`,
      `Keine UI-Entscheidungen; UI rendert nur Snapshots.`,
      ``,
      `## Heutiger Zustand (DailyView: 1–3 Themen)`,
      items || '(leer)',
      ``,
      `## Nächste sinnvolle Tasks`,
      `- Export: ThreadSnapshot -> Markdown stabil halten`,
      `- Command: CaptureImpulse erweitert um payloadRef (optional)`,
      `- Visual: Graph-Kanten -> VisualEdges mappen (Phase 1.1)`,
      ``,
      `## Akzeptanzkriterien`,
      `- Tests laufen`,
      `- Kein Feed, keine Endloslisten`,
      `- Keine Auto-Actions, keine Autonomie`,
      ``,
    ].join('\n');

    return {
      target: ExportTarget.CURSOR_PACK,
      filename: `CURSOR_PACK_${view.date}.md`,
      content: pack.trim(),
      meta: {
        createdAt: new Date(),
        note: view.note,
      },
    };
  }
}
