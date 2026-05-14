/**
 * ORIENT - Visual State Pipeline Tests
 * 
 * Tests für VisualStatePipeline.
 * Respektiert ORIENT_DNA: Deterministisch, testbar, UI-frei.
 */

import { describe, it, expect } from 'vitest';
import { VisualStatePipeline } from '@visual/pipeline/VisualStatePipeline';
import { DailyView } from '@app/queries/types/DailyView';
import { ThreadSnapshot } from '@app/queries/types/ThreadSnapshot';
import { EscalationLevel } from '@core/escalation/EscalationLevel';
import { Edge } from '@core/graph/Edge';
import { RelationType } from '@core/graph/RelationType';
import { NodeRef } from '@core/graph/NodeRef';

describe('VisualStatePipeline', () => {
  it('builds a visual state from daily view + edges + clusters + focus', () => {
    const dailyView: DailyView = {
      date: '2026-02-08',
      items: [
        {
          threadId: 't1',
          title: 'Feiern & Gestaltung',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.HINT,
            score: 0.7,
            reason: 'ok',
          },
          summary: 'Wunderkerzen-Servietten.',
          highlights: ['Wunderkerzen', 'Servietten'],
          uncertainties: [],
          provenance: {
            impulseCount: 2,
            edgeCount: 1,
          },
        },
        {
          threadId: 't2',
          title: 'Investieren',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.NOTE,
            score: 0.4,
            reason: 'ok',
          },
          summary: 'Beobachten.',
          highlights: [],
          uncertainties: ['Datenlage dünn.'],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
      ],
    };

    const edges: Edge[] = [
      {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.8,
          recency: 0.6,
          frequency: 0.3,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
    ];

    const state = VisualStatePipeline.build({
      dailyView,
      edges,
      context: 'NORMAL',
      clusterHint: { byThreadId: { t1: 'Lifestyle', t2: 'Finanzen' } },
      focus: { type: 'CLUSTER', id: 'cl_Lifestyle', zoom: 0.8 },
    });

    expect(state.nodes.length).toBe(2);
    expect(state.edges.length).toBe(1);
    expect(state.clusters.length).toBe(2);
    expect(state.focus?.id).toBe('cl_Lifestyle');
    expect(state.focus?.type).toBe('CLUSTER');
  });

  it('builds state without edges', () => {
    const dailyView: DailyView = {
      date: '2026-02-08',
      items: [
        {
          threadId: 't1',
          title: 'Test',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.OBSERVE,
            score: 0.3,
            reason: 'Test',
          },
          summary: 'Test',
          highlights: [],
          uncertainties: [],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
      ],
    };

    const state = VisualStatePipeline.build({
      dailyView,
      context: 'QUIET',
    });

    expect(state.nodes.length).toBe(1);
    expect(state.edges.length).toBe(0);
    expect(state.clusters.length).toBe(1); // Default cluster
  });

  it('builds state without clusters hint', () => {
    const dailyView: DailyView = {
      date: '2026-02-08',
      items: [
        {
          threadId: 't1',
          title: 'Test',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.OBSERVE,
            score: 0.3,
            reason: 'Test',
          },
          summary: 'Test',
          highlights: [],
          uncertainties: [],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
      ],
    };

    const state = VisualStatePipeline.build({
      dailyView,
      context: 'NORMAL',
    });

    expect(state.clusters.length).toBe(1);
    expect(state.clusters[0].label).toBe('Themen'); // Default cluster
  });

  it('builds state without focus', () => {
    const dailyView: DailyView = {
      date: '2026-02-08',
      items: [
        {
          threadId: 't1',
          title: 'Test',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: {
            level: EscalationLevel.OBSERVE,
            score: 0.3,
            reason: 'Test',
          },
          summary: 'Test',
          highlights: [],
          uncertainties: [],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
      ],
    };

    const state = VisualStatePipeline.build({
      dailyView,
      context: 'NORMAL',
    });

    expect(state.focus).toBeUndefined();
  });

  it('applies context to ambience', () => {
    const dailyView: DailyView = {
      date: '2026-02-08',
      items: [
        {
          threadId: 't1',
          title: 'Test',
          status: 'ACTIVE',
          tone: 'QUIET',
          escalation: {
            level: EscalationLevel.OBSERVE,
            score: 0.3,
            reason: 'Test',
          },
          summary: 'Test',
          highlights: [],
          uncertainties: [],
          provenance: {
            impulseCount: 1,
            edgeCount: 0,
          },
        },
      ],
    };

    const quietState = VisualStatePipeline.build({
      dailyView,
      context: 'QUIET',
    });

    const focusState = VisualStatePipeline.build({
      dailyView,
      context: 'FOCUS',
    });

    // QUIET sollte weniger Motion haben als FOCUS
    expect(quietState.ambience.motion).toBeLessThan(focusState.ambience.motion);
  });

  describe('DNA-Konformität', () => {
    it('is deterministic (DNA: gleiche Inputs = gleiche Outputs)', () => {
      const dailyView: DailyView = {
        date: '2026-02-08',
        items: [
          {
            threadId: 't1',
            title: 'Test',
            status: 'ACTIVE',
            tone: 'NORMAL',
            escalation: {
              level: EscalationLevel.NOTE,
              score: 0.5,
              reason: 'Test',
            },
            summary: 'Test',
            highlights: [],
            uncertainties: [],
            provenance: {
              impulseCount: 1,
              edgeCount: 0,
            },
          },
        ],
      };

      const state1 = VisualStatePipeline.build({
        dailyView,
        context: 'NORMAL',
        clusterHint: { byThreadId: { t1: 'Test' } },
      });

      const state2 = VisualStatePipeline.build({
        dailyView,
        context: 'NORMAL',
        clusterHint: { byThreadId: { t1: 'Test' } },
      });

      // Gleiche Inputs = gleiche Cluster
      expect(state1.clusters[0].id).toBe(state2.clusters[0].id);
      expect(state1.clusters[0].color).toBe(state2.clusters[0].color);
    });

    it('is UI-free (DNA: keine UI-Abhängigkeiten)', () => {
      const dailyView: DailyView = {
        date: '2026-02-08',
        items: [],
      };

      const state = VisualStatePipeline.build({
        dailyView,
        context: 'NORMAL',
      });

      // State ist reine Datenstruktur
      expect(state.nodes).toBeDefined();
      expect(state.edges).toBeDefined();
      expect(state.clusters).toBeDefined();
      expect(state.ambience).toBeDefined();
      // Keine UI-spezifischen Felder
    });

    it('has no fake aesthetics (DNA: alles ableitbar aus Daten)', () => {
      const dailyView: DailyView = {
        date: '2026-02-08',
        items: [
          {
            threadId: 't1',
            title: 'Test',
            status: 'ACTIVE',
            tone: 'NORMAL',
            escalation: {
              level: EscalationLevel.FRAME,
              score: 0.9,
              reason: 'Wichtig',
            },
            summary: 'Test',
            highlights: [],
            uncertainties: [],
            provenance: {
              impulseCount: 10,
              edgeCount: 5,
            },
          },
        ],
      };

      const state = VisualStatePipeline.build({
        dailyView,
        context: 'NORMAL',
      });

      // Jede visuelle Eigenschaft ist ableitbar
      expect(state.nodes[0].size).toBeGreaterThan(0);
      expect(state.nodes[0].intensity).toBeGreaterThan(0);
      expect(state.nodes[0].color).toBeDefined();
      // Alles basiert auf escalation.score, nicht auf Zufall
    });
  });
});
