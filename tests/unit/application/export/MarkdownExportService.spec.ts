/**
 * ORIENT - Markdown Export Service Tests
 * 
 * Tests für MarkdownExportService.
 * Respektiert ORIENT_DNA: Klarheit, keine Überkomplexität.
 */

import { describe, it, expect } from 'vitest';
import { MarkdownExportService } from '@app/export/MarkdownExportService';
import { EscalationLevel } from '@core/escalation/EscalationLevel';

describe('MarkdownExportService', () => {
  it('creates markdown export bundle', () => {
    const svc = new MarkdownExportService();

    const bundle = svc.threadSnapshotToMarkdown({
      threadId: 't1',
      title: 'Test Thema',
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
    });

    expect(bundle.filename).toContain('thread_t1');
    expect(bundle.content).toContain('# Test Thema');
    expect(bundle.content).toContain('## Zusammenfassung');
    expect(bundle.content).toContain('## Highlights');
    expect(bundle.content).toContain('## Unsicherheiten');
    expect(bundle.content).toContain('## Herkunft');
    expect(bundle.meta?.threadId).toBe('t1');
  });

  it('handles empty highlights and uncertainties', () => {
    const svc = new MarkdownExportService();

    const bundle = svc.threadSnapshotToMarkdown({
      threadId: 't2',
      title: 'Leeres Thema',
      status: 'DORMANT',
      tone: 'QUIET',
      escalation: {
        level: EscalationLevel.OBSERVE,
        score: 0.1,
        reason: 'Ruhe.',
      },
      summary: 'Leer.',
      highlights: [],
      uncertainties: [],
      provenance: {
        impulseCount: 0,
        edgeCount: 0,
      },
    });

    expect(bundle.content).toContain('## Highlights');
    expect(bundle.content).toContain('- (keine)');
    expect(bundle.content).toContain('## Unsicherheiten');
  });

  it('handles missing lastActivityAt', () => {
    const svc = new MarkdownExportService();

    const bundle = svc.threadSnapshotToMarkdown({
      threadId: 't3',
      title: 'Ohne Aktivität',
      status: 'OBSERVED',
      tone: 'NORMAL',
      escalation: {
        level: EscalationLevel.NOTE,
        score: 0.3,
        reason: 'Beobachtet.',
      },
      summary: 'Keine Aktivität.',
      highlights: [],
      uncertainties: [],
      provenance: {
        impulseCount: 1,
        edgeCount: 0,
      },
    });

    expect(bundle.content).toContain('Letzte Aktivität: (unbekannt)');
  });

  describe('DNA-Konformität', () => {
    it('creates clear, structured markdown (DNA: Ruhe vor Geschwindigkeit)', () => {
      const svc = new MarkdownExportService();

      const bundle = svc.threadSnapshotToMarkdown({
        threadId: 't4',
        title: 'DNA-Test',
        status: 'ACTIVE',
        tone: 'NORMAL',
        escalation: {
          level: EscalationLevel.FRAME,
          score: 0.8,
          reason: 'Wichtig.',
        },
        summary: 'Test.',
        highlights: ['H1'],
        uncertainties: ['U1'],
        provenance: {
          impulseCount: 5,
          edgeCount: 3,
          lastActivityAt: new Date(),
        },
      });

      // Strukturiert, nicht chaotisch
      expect(bundle.content).toContain('# DNA-Test');
      expect(bundle.content).toContain('## Zusammenfassung');
      expect(bundle.content).toContain('## Highlights');
      expect(bundle.content).toContain('## Unsicherheiten');
      expect(bundle.content).toContain('## Herkunft');
    });

    it('includes provenance (DNA: Transparenz)', () => {
      const svc = new MarkdownExportService();

      const bundle = svc.threadSnapshotToMarkdown({
        threadId: 't5',
        title: 'Provenance-Test',
        status: 'ACTIVE',
        tone: 'NORMAL',
        escalation: {
          level: EscalationLevel.NOTE,
          score: 0.5,
          reason: 'Test.',
        },
        summary: 'Test.',
        highlights: [],
        uncertainties: [],
        provenance: {
          impulseCount: 10,
          edgeCount: 5,
          lastActivityAt: new Date(),
        },
      });

      expect(bundle.content).toContain('Impulse: 10');
      expect(bundle.content).toContain('Verknüpfungen: 5');
    });
  });
});
