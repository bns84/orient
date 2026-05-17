import { EscalationLevel } from '../core/escalation/EscalationLevel';

export function escalationLevelLabel(level: EscalationLevel): string {
  switch (level) {
    case EscalationLevel.FRAME:
      return 'Einordnung';
    case EscalationLevel.HINT:
      return 'Hinweis';
    case EscalationLevel.NOTE:
      return 'Merken';
    case EscalationLevel.OBSERVE:
    default:
      return 'Beobachten';
  }
}

/** Kurz für kompaktes HUD */
export function escalationLevelShort(level: EscalationLevel): string {
  if (level >= EscalationLevel.FRAME) return 'Stufe 3';
  if (level === EscalationLevel.HINT) return 'Stufe 2';
  if (level === EscalationLevel.NOTE) return 'Stufe 1';
  return 'Stufe 0';
}

export function shouldShowHud(level: EscalationLevel, uncertaintyCount: number, hasFocus: boolean): boolean {
  return hasFocus || level > EscalationLevel.OBSERVE || uncertaintyCount > 0;
}
