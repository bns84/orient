/**
 * ORIENT - Edge Weights
 * 
 * Gewichte sind bewusst einfach (0..1).
 * Keine Magie, keine komplexen Berechnungen.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Ruhe vor Geschwindigkeit
 */

export interface EdgeWeights {
  confidence: number;     // 0..1
  recency: number;        // 0..1
  frequency: number;      // 0..1
  userRelevance: number;  // 0..1
  sourceWeight?: number;  // 0..1 (optional, wenn aus Quellen)
}

/**
 * Begrenzt einen Wert auf 0..1
 */
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Normalisiert alle Gewichte auf 0..1
 */
export const normalizeWeights = (w: EdgeWeights): EdgeWeights => ({
  confidence: clamp01(w.confidence),
  recency: clamp01(w.recency),
  frequency: clamp01(w.frequency),
  userRelevance: clamp01(w.userRelevance),
  sourceWeight: w.sourceWeight === undefined ? undefined : clamp01(w.sourceWeight),
});
