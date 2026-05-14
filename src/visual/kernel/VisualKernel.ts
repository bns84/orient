/**
 * ORIENT - Visual Kernel
 * 
 * Die Übersetzungsmaschine: System-Snapshots → VisualState.
 * 
 * Respektiert ORIENT_DNA:
 * - Jeder visuelle Effekt ist ableitbar aus Daten
 * - Kein "intelligent aussehendes Wabern ohne Grund"
 * - Transparenz statt Blackbox
 */

import { ThreadSnapshot } from '@app/queries/types/ThreadSnapshot';
import { VisualState } from './VisualState';
import { VisualNode } from './VisualNode';
import { VisualMappingPolicy } from './VisualMappingPolicy';

export class VisualKernel {
  /**
   * Übersetzt Thread-Snapshots in VisualState
   * DNA: Jeder Knoten ist ableitbar aus Daten
   */
  static fromThreadSnapshots(
    snaps: ThreadSnapshot[],
    context: 'QUIET' | 'NORMAL' | 'FOCUS',
  ): VisualState {
    const nodes: VisualNode[] = snaps.map((s, idx) => ({
      id: s.threadId,
      type: 'THREAD',
      position: spiral(idx),
      size: VisualMappingPolicy.sizeForRelevance(s.escalation.score),
      intensity: VisualMappingPolicy.intensityForEscalation(
        s.escalation.level,
        s.escalation.score,
      ),
      stability: VisualMappingPolicy.stabilityForConfidence(s.escalation.score),
      color: VisualMappingPolicy.colorForThread(s.escalation.level),
      opacity: 1,
      semanticWeight: s.escalation.score,
    }));

    return {
      nodes,
      edges: [], // Phase 1: später aus Graph
      clusters: [], // Phase 2
      ambience: VisualMappingPolicy.ambienceFromContext(context),
    };
  }

  /**
   * Cold Start: Nur Lichtpunkt
   * DNA: Stille ist ein Feature
   */
  static coldStart(): VisualState {
    return {
      nodes: [],
      edges: [],
      clusters: [],
      ambience: {
        motion: 0.05,
        glow: 0.1,
        noise: 0.0,
      },
    };
  }
}

/**
 * Spiral-Positionierung für Threads
 * Einfach, deterministisch, keine Magie
 */
const spiral = (i: number): { x: number; y: number; z: number } => ({
  x: Math.cos(i) * i * 0.1,
  y: Math.sin(i) * i * 0.1,
  z: -i * 0.05,
});
