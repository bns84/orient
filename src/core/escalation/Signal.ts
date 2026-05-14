/**
 * ORIENT - Signal
 * 
 * Ein "Signal" ist eine neutrale Zusammenfassung dessen, was ORIENT gerade sieht.
 * Keine Diagnose, kein Drama, nur Zahlen + Status.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Ruhe vor Geschwindigkeit
 * - Kontext beeinflusst nur Intensität, nie Inhalte
 */

import { ContextMode } from './ContextMode';

export type ThreadStatus = 'ACTIVE' | 'OBSERVED' | 'DORMANT' | 'CLOSED';

export interface Signal {
  // Thread-Kern
  threadStatus: ThreadStatus;

  // Gewichtungen 0..1 (aus Graph/Thread-Metriken)
  confidence: number;
  recency: number;
  frequency: number;
  userRelevance: number;

  // "Bedeutungsbruch" (optional): z.B. Narrativ-Shift, Kipp-Punkt
  shift?: {
    strength: number; // 0..1
    type?: 'NARRATIVE_SHIFT' | 'BEHAVIOR_KINK' | 'COUPLING' | 'REACTIVATION';
  };

  // User-Kontext beeinflusst nur Intensität, nie Inhalte
  contextMode: ContextMode;

  // User-Opt-in/Opt-out für Hinweise
  allowHints: boolean;

  // tägliches Limit (z.B. durch Kontext "Familie")
  hintBudgetRemaining: number; // integer >= 0
}
