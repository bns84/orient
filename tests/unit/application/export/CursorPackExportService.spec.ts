/**
 * ORIENT - Cursor Pack Export Service Tests
 * 
 * Tests für CursorPackExportService.
 * Respektiert ORIENT_DNA: Klarheit, DNA explizit, konkrete Aufgaben.
 */

import { describe, it, expect } from 'vitest';
import { CursorPackExportService } from '@app/export/CursorPackExportService';
import { EscalationLevel } from '@core/escalation/EscalationLevel';

describe('CursorPackExportService', () => {
  it('creates cursor pack export bundle', () => {
    const svc = new CursorPackExportService();

    const bundle = svc.dailyViewToCursorPack({
      date: '2026-01-15',
      items: [
        {
          threadId: 't1',
          title: 'Test Thema 1',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.HINT,
            score: 0.6,
            reason: 'Kontext normal.',
          },
          summary: 'Kurz.',
          highlights: ['A', 'B'],
          uncertainties: ['U1'],
          provenance: {
            impulseCount: 2,
            edgeCount: 1,
            lastActivityAt: new Date(),
          },
        },
      ],
    });

    expect(bundle.filename).toContain('CURSOR_PACK_2026-01-15');
    expect(bundle.content).toContain('# ORIENT — Cursor Pack');
    expect(bundle.content).toContain('## DNA (unverhandelbar)');
    expect(bundle.content).toContain('## Aufgabe an Cursor');
    expect(bundle.content).toContain('## Heutiger Zustand');
    expect(bundle.content).toContain('## Nächste sinnvolle Tasks');
    expect(bundle.content).toContain('## Akzeptanzkriterien');
  });

  it('includes DNA principles explicitly', () => {
    const svc = new CursorPackExportService();

    const bundle = svc.dailyViewToCursorPack({
      date: '2026-01-15',
      items: [],
    });

    expect(bundle.content).toContain('Ruhe vor Geschwindigkeit');
    expect(bundle.content).toContain('local-first');
    expect(bundle.content).toContain('keine automatische Löschung');
    expect(bundle.content).toContain('Stille ist ein Feature');
    expect(bundle.content).toContain('keine Engagement-Optimierung');
    expect(bundle.content).toContain('LLM ist nur Stimme/Vorschlag');
  });

  it('handles empty daily view', () => {
    const svc = new CursorPackExportService();

    const bundle = svc.dailyViewToCursorPack({
      date: '2026-01-15',
      items: [],
    });

    expect(bundle.content).toContain('(leer)');
  });

  it('formats multiple items correctly', () => {
    const svc = new CursorPackExportService();

    const bundle = svc.dailyViewToCursorPack({
      date: '2026-01-15',
      items: [
        {
          threadId: 't1',
          title: 'Thema 1',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.NOTE,
            score: 0.5,
            reason: 'Test 1.',
          },
          summary: 'Summary 1',
          highlights: ['H1'],
          uncertainties: [],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
        {
          threadId: 't2',
          title: 'Thema 2',
          status: 'OBSERVED',
          tone: 'QUIET',
          escalation: {
            level: EscalationLevel.OBSERVE,
            score: 0.2,
            reason: 'Test 2.',
          },
          summary: 'Summary 2',
          highlights: [],
          uncertainties: ['U1'],
          provenance: {
            impulseCount: 2,
            edgeCount: 1,
          },
        },
      ],
    });

    expect(bundle.content).toContain('### 1) Thema 1');
    expect(bundle.content).toContain('### 2) Thema 2');
  });

  describe('DNA-Konformität', () => {
    it('emphasizes incremental and testable approach (DNA: Ruhe vor Geschwindigkeit)', () => {
      const svc = new CursorPackExportService();

      const bundle = svc.dailyViewToCursorPack({
        date: '2026-01-15',
        items: [],
      });

      expect(bundle.content).toContain('inkrementell');
      expect(bundle.content).toContain('testbar');
    });

    it('explicitly states no auto-actions (DNA: keine Autonomie)', () => {
      const svc = new CursorPackExportService();

      const bundle = svc.dailyViewToCursorPack({
        date: '2026-01-15',
        items: [],
      });

      expect(bundle.content).toContain('Keine Auto-Actions');
      expect(bundle.content).toContain('keine Autonomie');
    });
  });
});
