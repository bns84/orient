/**
 * Eskalationsstufe → sanfte Bubble-Modifikation (ohne Alarmismus).
 */

import { EscalationLevel } from '../../core/escalation/EscalationLevel';
import type { ContextBubbleModifier } from './contextBubbleModifiers';

export function escalationBubbleModifier(level: EscalationLevel): ContextBubbleModifier {
  switch (level) {
    case EscalationLevel.FRAME:
      return { activationScale: 1.14, activationBias: 0.09, extraActiveRegions: [2, 4] };
    case EscalationLevel.HINT:
      return { activationScale: 1.06, activationBias: 0.04, extraActiveRegions: [4] };
    case EscalationLevel.NOTE:
      return { activationScale: 1.02, activationBias: 0.02, extraActiveRegions: [] };
    default:
      return { activationScale: 1, activationBias: 0, extraActiveRegions: [] };
  }
}

export function mergeBubbleModifiers(
  a: ContextBubbleModifier,
  b: ContextBubbleModifier,
): ContextBubbleModifier {
  const regions = new Set([...a.extraActiveRegions, ...b.extraActiveRegions]);
  return {
    activationScale: Math.min(1.25, a.activationScale * b.activationScale),
    activationBias: Math.min(0.12, a.activationBias + b.activationBias),
    extraActiveRegions: [...regions],
  };
}
