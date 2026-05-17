/**
 * Kontext-Modus → Bubble-Aktivierung (ruhig vs. fokussiert).
 */

import { ContextMode } from '../../core/escalation/ContextMode';

export type ContextBubbleModifier = {
  activationScale: number;
  activationBias: number;
  extraActiveRegions: number[];
};

export function contextBubbleModifier(mode: ContextMode): ContextBubbleModifier {
  switch (mode) {
    case ContextMode.QUIET:
    case ContextMode.FAMILY:
    case ContextMode.SOCIAL:
      return { activationScale: 0.72, activationBias: -0.05, extraActiveRegions: [] };
    case ContextMode.FOCUS:
      return { activationScale: 1.1, activationBias: 0.07, extraActiveRegions: [3, 5] };
    default:
      return { activationScale: 1, activationBias: 0, extraActiveRegions: [] };
  }
}
