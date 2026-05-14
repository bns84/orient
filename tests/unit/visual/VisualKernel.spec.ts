/**
 * ORIENT - Visual Kernel Tests
 * 
 * Tests für Visual-Kernel.
 * Respektiert ORIENT_DNA: Jeder Effekt ist ableitbar aus Daten.
 */

import { describe, it, expect } from 'vitest';
import { VisualKernel } from '@visual/kernel/VisualKernel';
import { EscalationLevel } from '@core/escalation/EscalationLevel';

describe('VisualKernel', () => {
  it('maps thread snapshots to visual nodes', () => {
    const state = VisualKernel.fromThreadSnapshots(
      [
        {
          threadId: 't1',
          title: 'Test',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: { level: EscalationLevel.HINT, score: 0.7, reason: 'x' },
          summary: 'x',
          highlights: [],
          uncertainties: [],
          provenance: { impulseCount: 1, edgeCount: 0 },
        },
      ],
      'NORMAL',
    );

    expect(state.nodes.length).toBe(1);
    expect(state.nodes[0].intensity).toBeGreaterThan(0.5);
    expect(state.nodes[0].type).toBe('THREAD');
    expect(state.nodes[0].id).toBe('t1');
  });

  it('creates cold start state (only lightpoint)', () => {
    const state = VisualKernel.coldStart();

    expect(state.nodes.length).toBe(0);
    expect(state.edges.length).toBe(0);
    expect(state.clusters.length).toBe(0);
    expect(state.ambience.motion).toBeLessThan(0.1); // Sehr ruhig
    expect(state.ambience.glow).toBeLessThan(0.2); // Minimales Leuchten
  });

  it('maps multiple threads with different escalations', () => {
    const state = VisualKernel.fromThreadSnapshots(
      [
        {
          threadId: 't1',
          title: 'High Priority',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: { level: EscalationLevel.FRAME, score: 0.9, reason: 'x' },
          summary: 'x',
          highlights: [],
          uncertainties: [],
          provenance: { impulseCount: 5, edgeCount: 3 },
        },
        {
          threadId: 't2',
          title: 'Low Priority',
          status: 'ACTIVE',
          tone: 'NORMAL',
          escalation: { level: EscalationLevel.NOTE, score: 0.3, reason: 'x' },
          summary: 'x',
          highlights: [],
          uncertainties: [],
          provenance: { impulseCount: 1, edgeCount: 0 },
        },
      ],
      'NORMAL',
    );

    expect(state.nodes.length).toBe(2);
    const t1 = state.nodes.find((n) => n.id === 't1');
    const t2 = state.nodes.find((n) => n.id === 't2');

    expect(t1?.intensity).toBeGreaterThan(t2?.intensity || 0);
    expect(t1?.size).toBeGreaterThan(t2?.size || 0);
  });

  it('adjusts ambience based on context', () => {
    const quiet = VisualKernel.fromThreadSnapshots([], 'QUIET');
    const normal = VisualKernel.fromThreadSnapshots([], 'NORMAL');
    const focus = VisualKernel.fromThreadSnapshots([], 'FOCUS');

    expect(quiet.ambience.motion).toBeLessThan(normal.ambience.motion);
    expect(quiet.ambience.glow).toBeLessThan(normal.ambience.glow);
    expect(focus.ambience.glow).toBeGreaterThan(normal.ambience.glow);
  });

  describe('DNA-Konformität', () => {
    it('every visual effect is derivable from data (DNA: Transparenz)', () => {
      const state = VisualKernel.fromThreadSnapshots(
        [
          {
            threadId: 't1',
            title: 'Test',
            status: 'ACTIVE',
            tone: 'NORMAL',
            escalation: { level: EscalationLevel.FRAME, score: 0.8, reason: 'x' },
            summary: 'x',
            highlights: [],
            uncertainties: [],
            provenance: { impulseCount: 5, edgeCount: 3 },
          },
        ],
        'NORMAL',
      );

      const node = state.nodes[0];

      // Jede Eigenschaft ist ableitbar aus Daten
      expect(node.intensity).toBeGreaterThan(0); // Aus Escalation
      expect(node.size).toBeGreaterThan(0); // Aus Score
      expect(node.stability).toBeGreaterThan(0); // Aus Confidence
      expect(node.color).toBeDefined(); // Aus Escalation-Level
    });

    it('no fake activity without data (DNA: keine Blackbox)', () => {
      const state = VisualKernel.coldStart();

      // Keine Knoten, keine Aktivität
      expect(state.nodes.length).toBe(0);
      expect(state.ambience.motion).toBeLessThan(0.1); // Sehr ruhig
    });
  });
});
