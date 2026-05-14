/**
 * ORIENT - Visual Edge Mapping
 * 
 * Hier legen wir fest, wie Kanten dargestellt werden:
 * - Confidence → Stabilität/Opacity
 * - Frequency/Recency → Flow
 * - RelationType → Tendenz (dünn vs. stark)
 * 
 * Respektiert ORIENT_DNA:
 * - Jeder visuelle Effekt ist ableitbar aus Daten
 * - Kein "intelligent aussehendes Wabern ohne Grund"
 * - Transparenz statt Blackbox
 */

import { Edge } from '@core/graph/Edge';
import { VisualEdge } from './VisualEdge';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export class VisualEdgeMapping {
  /**
   * Konvertiert Edge zu VisualEdge
   * DNA: Deterministisch, nachvollziehbar
   */
  static toVisualEdge(edge: Edge): VisualEdge {
    const c = clamp01(edge.weights.confidence);
    const r = clamp01(edge.weights.recency);
    const f = clamp01(edge.weights.frequency);

    // thickness: confidence dominiert, frequency unterstützt
    // DNA: Dicke = Stabilität, nicht Dekoration
    const thickness = clamp01(0.7 * c + 0.3 * f);

    // opacity: confidence + recency
    // DNA: Sichtbarkeit = Relevanz + Aktualität
    const opacity = clamp01(0.6 * c + 0.4 * r);

    // flow: recency (aktueller = mehr Puls), frequency unterstützt
    // DNA: Puls = Aktivität, nicht Zufall
    const flow = clamp01(0.7 * r + 0.3 * f);

    return {
      id: edge.id,
      from: edge.from.id,
      to: edge.to.id,
      thickness,
      opacity,
      flow,
      confidence: c,
    };
  }
}
