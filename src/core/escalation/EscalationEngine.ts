/**
 * ORIENT - Escalation Engine
 * 
 * Evaluates Signals und bestimmt Eskalations-Level.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 * - Kontext-Respekt
 * - Transparenz statt Blackbox
 */

import { EscalationLevel } from './EscalationLevel';
import { EscalationPolicy } from './EscalationPolicy';
import { Signal } from './Signal';

export class EscalationEngine {
  /**
   * Evaluates ein Signal und gibt Level + Score zurück
   */
  static evaluate(signal: Signal): { level: EscalationLevel; score: number } {
    const score = EscalationPolicy.baseScore(signal);
    const proposed = EscalationPolicy.levelFromScore(score);
    const level = EscalationPolicy.applyGuards(signal, proposed);

    return { level, score };
  }
}
