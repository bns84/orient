/**
 * ORIENT - Visual Node
 * 
 * Ein visueller Knoten (nicht identisch mit Graph-Node).
 * 
 * Respektiert ORIENT_DNA:
 * - Jeder visuelle Effekt ist ableitbar aus Daten
 * - Kein "intelligent aussehendes Wabern ohne Grund"
 */

export type VisualNodeType =
  | 'THREAD'
  | 'IMPULSE'
  | 'ENTITY'
  | 'DUST'; // unfertige Gedanken

export interface VisualNode {
  id: string;
  type: VisualNodeType;

  // Raum
  position: {
    x: number;
    y: number;
    z: number;
  };

  // Erscheinung
  size: number;        // 0..1
  intensity: number;   // 0..1 (Leuchten)
  stability: number;   // 0..1 (ruhig vs. wabernd)

  color: string;       // z.B. hex oder token
  opacity: number;     // 0..1

  // Bedeutung
  semanticWeight: number; // 0..1 (Relevanz)
}
