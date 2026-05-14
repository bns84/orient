/**
 * ORIENT - Escalation Policy
 * 
 * Policy kapselt ORIENT-DNA: Ruhe, Zurückhaltung, Kontext-Respekt.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 * - Kontext-Respekt
 * - Keine Push-Notifications
 * - Kein Erzwingen
 */

import { ContextMode } from './ContextMode';
import { EscalationLevel } from './EscalationLevel';
import { Signal } from './Signal';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export class EscalationPolicy {
  /**
   * Kontext dämpft Output. Inhalte bleiben unberührt.
   * DNA: Kontext-Respekt
   */
  static contextCap(mode: ContextMode): EscalationLevel {
    switch (mode) {
      case ContextMode.QUIET:
      case ContextMode.FAMILY:
      case ContextMode.SOCIAL:
        return EscalationLevel.NOTE; // maximal merken
      case ContextMode.NORMAL:
        return EscalationLevel.FRAME;
      case ContextMode.FOCUS:
        return EscalationLevel.FRAME;
      default:
        return EscalationLevel.FRAME;
    }
  }

  /**
   * Basisscore: wie stark "verdichtet" das Signal ist.
   * Minimalistisch, nachvollziehbar, keine Magie.
   * DNA: Transparenz statt Blackbox
   */
  static baseScore(s: Signal): number {
    const c = clamp01(s.confidence);
    const r = clamp01(s.recency);
    const f = clamp01(s.frequency);
    const u = clamp01(s.userRelevance);
    const shift = clamp01(s.shift?.strength ?? 0);

    // Fokus: Relevanz + Confidence + Recency; Frequency ist unterstützend
    return clamp01(0.35 * u + 0.30 * c + 0.25 * r + 0.05 * f + 0.05 * shift);
  }

  /**
   * Mapping Score -> Level (Phase 1: 0..3)
   * DNA: Ruhe vor Geschwindigkeit
   */
  static levelFromScore(score: number): EscalationLevel {
    if (score < 0.25) return EscalationLevel.OBSERVE;
    if (score < 0.45) return EscalationLevel.NOTE;
    if (score < 0.70) return EscalationLevel.HINT;
    return EscalationLevel.FRAME;
  }

  /**
   * DNA-Regeln / Sicherheitsbremsen
   * DNA: Kein Erzwingen, Stille respektiert, Kontext-Respekt
   */
  static applyGuards(s: Signal, proposed: EscalationLevel): EscalationLevel {
    // Keine Eskalation, wenn Thread geschlossen
    // DNA: CLOSED bedeutet explizit abgeschlossen
    if (s.threadStatus === 'CLOSED') {
      return EscalationLevel.OBSERVE;
    }

    // Dormant bedeutet: nicht aufdrängen (max NOTE), außer explizite Reaktivierung/Shift stark
    // DNA: Stille respektiert, keine Push-Notifications
    if (s.threadStatus === 'DORMANT') {
      const strongShift = (s.shift?.strength ?? 0) >= 0.75;
      return strongShift ? Math.min(proposed, EscalationLevel.HINT) : EscalationLevel.NOTE;
    }

    // Wenn Hints nicht erlaubt: max NOTE
    // DNA: User-Opt-in/Opt-out respektiert
    if (!s.allowHints) {
      return Math.min(proposed, EscalationLevel.NOTE);
    }

    // Hint-Budget: wenn leer, max NOTE
    // DNA: Kontext-Respekt (z.B. Familie = niedriges Budget)
    if (s.hintBudgetRemaining <= 0) {
      return Math.min(proposed, EscalationLevel.NOTE);
    }

    // Kontext cap
    // DNA: Kontext beeinflusst nur Intensität, nie Inhalte
    const cap = EscalationPolicy.contextCap(s.contextMode);
    return Math.min(proposed, cap);
  }
}
