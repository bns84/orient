/**
 * ORIENT - Thread Scoring Helper
 * 
 * Ziel: lesbare Auswahl (kein ML). Minimaler Score für DailyView.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Ruhe vor Geschwindigkeit
 */

import { EscalationLevel } from '@core/escalation/EscalationLevel';

/**
 * Berechnet Prioritäts-Score für DailyView
 * Level dominiert, Score feinjustiert.
 */
export const dailyPriorityScore = (level: EscalationLevel, score: number): number => {
  // Level dominiert, Score feinjustiert.
  const base =
    level === EscalationLevel.FRAME ? 3 :
    level === EscalationLevel.HINT ? 2 :
    level === EscalationLevel.NOTE ? 1 :
    0;

  return base + score; // 0..4 ungefähr
};
