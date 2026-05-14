/**
 * ORIENT - Visual Kernel Graph
 * 
 * Erweitert VisualState um Kanten.
 * Wichtig: Wir mappen nur Edges, deren Endpunkte im aktuellen VisualState existieren.
 * 
 * Respektiert ORIENT_DNA:
 * - Wenn etwas verbunden aussieht, IST es verbunden
 * - Keine Fake-Verbindungen
 * - Transparenz statt Blackbox
 */

import { VisualState } from './VisualState';
import { Edge } from '@core/graph/Edge';
import { VisualEdgeMapping } from './VisualEdgeMapping';

export class VisualKernelGraph {
  /**
   * Fügt Kanten zu VisualState hinzu
   * DNA: Nur sichtbare Knoten werden verbunden
   */
  static attachEdges(state: VisualState, edges: Edge[]): VisualState {
    const nodeIds = new Set(state.nodes.map((n) => n.id));

    // Nur Edges, deren Endpunkte sichtbar sind
    const usable = edges.filter(
      (e) => nodeIds.has(e.from.id) && nodeIds.has(e.to.id),
    );

    const visualEdges = usable.map(VisualEdgeMapping.toVisualEdge);

    return {
      ...state,
      edges: visualEdges,
    };
  }
}
