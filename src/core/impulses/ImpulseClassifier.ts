/**
 * ORIENT - Impulse Classifier Interface
 * 
 * Optional: Klassifizierung von Impulsen.
 * Nur Interface - keine KI-Logik jetzt.
 * 
 * Respektiert ORIENT_DNA:
 * - Nicht zu früh strukturieren
 * - Vorschläge, keine Entscheidungen
 * - Transparenz (Confidence-Level)
 */

import { Impulse } from './Impulse';

export interface ImpulseClassifier {
  /**
   * Klassifiziert einen Impulse
   * Gibt Vorschläge, keine Entscheidungen
   */
  classify(impulse: Impulse): {
    suggestedThreadTitles?: string[];
    confidence: number;  // 0..1
  };
}
