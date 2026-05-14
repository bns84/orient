/**
 * ORIENT - Visual Edge
 * 
 * Verbindungen = Denkadern.
 * 
 * Respektiert ORIENT_DNA:
 * - Jede Verbindung ist ableitbar aus Graph-Daten
 * - Keine dekorativen Verbindungen
 */

export interface VisualEdge {
  id: string;
  from: string;
  to: string;

  thickness: number;   // 0..1
  opacity: number;     // 0..1
  flow: number;        // 0..1 (Bewegung / Puls)

  confidence: number;  // 0..1
}
