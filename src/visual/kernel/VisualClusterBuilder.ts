/**
 * ORIENT - Visual Cluster Builder
 * 
 * Phase 1.2 (einfach & robust):
 * Cluster werden zunächst aus Thread-Tags oder "topicKey" gebaut.
 * Wenn noch keine Tags existieren: fallback auf „ein Cluster".
 * 
 * Vorteil: wir blockieren nicht auf ML/LLM/Graph-Community-Detection.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfach, robust)
 * - Transparenz (deterministisch, nachvollziehbar)
 * - Keine Fake-Cluster
 */

import { VisualCluster } from './VisualCluster';
import { VisualNode } from './VisualNode';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface ClusterHint {
  // optional: threadId -> clusterKey
  byThreadId?: Record<string, string>;
}

export class VisualClusterBuilder {
  /**
   * Baut Cluster aus Nodes und optionalem Hint
   * DNA: Deterministisch, keine Zufälligkeit
   */
  static build(nodes: VisualNode[], hint?: ClusterHint): VisualCluster[] {
    const groups = new Map<string, VisualNode[]>();

    for (const n of nodes) {
      if (n.type !== 'THREAD') continue;

      const key = hint?.byThreadId?.[n.id] ?? 'DEFAULT';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(n);
    }

    const clusters: VisualCluster[] = [];
    for (const [key, list] of groups.entries()) {
      const center = averagePosition(list);
      const density = clamp01(list.length / 10); // 10 Threads -> dicht
      const radius = clamp01(0.2 + (1 - density) * 0.6); // dichter -> kleiner

      clusters.push({
        id: `cl_${key}`,
        label: key === 'DEFAULT' ? 'Themen' : key,
        center,
        radius,
        density,
        color: pickClusterColor(key),
        dominant: false,
      });
    }

    // dominant = größtes Cluster
    const max = clusters.slice().sort((a, b) => b.density - a.density)[0];
    if (max) max.dominant = true;

    return clusters;
  }
}

/**
 * Berechnet Durchschnittsposition einer Node-Liste
 * DNA: Einfach, deterministisch
 */
const averagePosition = (nodes: VisualNode[]): { x: number; y: number; z: number } => {
  if (nodes.length === 0) return { x: 0, y: 0, z: 0 };
  const x = nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length;
  const y = nodes.reduce((s, n) => s + n.position.y, 0) / nodes.length;
  const z = nodes.reduce((s, n) => s + n.position.z, 0) / nodes.length;
  return { x, y, z };
};

/**
 * Wählt deterministische Farbe für Cluster
 * DNA: Keine Zufälligkeit, nachvollziehbar
 */
const pickClusterColor = (key: string): string => {
  // deterministic palette
  const palette = ['#4EA8DE', '#8E9AAF', '#FFD166', '#06D6A0', '#9B5DE5', '#F15BB5'];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
};
