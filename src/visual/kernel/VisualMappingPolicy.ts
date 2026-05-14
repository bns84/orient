/**
 * ORIENT - Visual Mapping Policy
 * 
 * Hier passiert die Magie – aber deterministisch.
 * Regeln, keine Kunst.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Jede Regel ist nachvollziehbar
 * - Ruhe vor Geschwindigkeit
 */

import { EscalationLevel } from '@core/escalation/EscalationLevel';

export class VisualMappingPolicy {
  /**
   * Farbe für Thread basierend auf Eskalation
   * DNA: Farben sind semantisch, nicht dekorativ
   */
  static colorForThread(escalation: EscalationLevel): string {
    switch (escalation) {
      case EscalationLevel.FRAME:
        return '#FFD166'; // warmes Gold (Einordnung / Konsequenzen)
      case EscalationLevel.HINT:
        return '#4EA8DE'; // Blau (Hinweis)
      case EscalationLevel.NOTE:
        return '#6C757D'; // Grau (Vermerken)
      default:
        return '#343A40'; // Dunkel (Beobachten)
    }
  }

  /**
   * Größe basierend auf Relevanz
   * DNA: Größe = Bedeutung, nicht Dekoration
   */
  static sizeForRelevance(r: number): number {
    return Math.min(1, Math.max(0.2, r));
  }

  /**
   * Stabilität basierend auf Confidence
   * DNA: Unsicherheit wird sichtbar gemacht
   */
  static stabilityForConfidence(c: number): number {
    return Math.min(1, Math.max(0.1, c));
  }

  /**
   * Ambience basierend auf Kontext
   * DNA: Kontext beeinflusst Intensität, nicht Inhalte
   */
  static ambienceFromContext(context: 'QUIET' | 'NORMAL' | 'FOCUS'): {
    motion: number;
    glow: number;
    noise: number;
  } {
    if (context === 'QUIET') {
      return { motion: 0.1, glow: 0.2, noise: 0.05 };
    }
    if (context === 'FOCUS') {
      return { motion: 0.3, glow: 0.6, noise: 0.1 };
    }
    return { motion: 0.4, glow: 0.4, noise: 0.15 };
  }

  /**
   * Intensität basierend auf Eskalation
   * DNA: Höhere Eskalation = mehr Leuchten
   */
  static intensityForEscalation(level: EscalationLevel, score: number): number {
    const base =
      level === EscalationLevel.FRAME ? 0.8 :
      level === EscalationLevel.HINT ? 0.6 :
      level === EscalationLevel.NOTE ? 0.4 :
      0.2;

    return Math.min(1, base + score * 0.2);
  }
}
