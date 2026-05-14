/**
 * ORIENT - Thread Snapshot Type
 * 
 * Strukturierte Darstellung eines Threads für HUD/Export.
 * Keine UI, keine Visuals, nur Daten.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Transparenz statt Blackbox
 * - Kein Feed, keine Endlosliste
 */

import { EscalationLevel } from '@core/escalation/EscalationLevel';

export type SnapshotTone = 'QUIET' | 'NORMAL' | 'FOCUS';

export interface SnapshotSignal {
  level: EscalationLevel;
  score: number; // 0..1
  reason: string; // kurze Erklärung (transparent, ruhig)
}

export interface ThreadSnapshot {
  threadId: string;
  title: string;
  status: 'ACTIVE' | 'OBSERVED' | 'DORMANT' | 'CLOSED';

  tone: SnapshotTone;

  // "HUD"
  escalation: SnapshotSignal;

  // Verdichtete Darstellung (kein Feed)
  summary: string;          // 1–2 Sätze
  highlights: string[];     // max 3 bullets
  uncertainties: string[];  // max 2 bullets

  // "Warum jetzt?"
  provenance: {
    impulseCount: number;
    edgeCount: number;
    lastActivityAt?: Date;
  };
}
