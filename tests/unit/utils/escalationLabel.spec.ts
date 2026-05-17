import { describe, expect, it } from 'vitest';
import { EscalationLevel } from '../../../src/core/escalation/EscalationLevel';
import {
  escalationLevelLabel,
  escalationLevelShort,
  shouldShowHud,
} from '../../../src/utils/escalationLabel';

describe('escalationLabel', () => {
  it('labels levels', () => {
    expect(escalationLevelLabel(EscalationLevel.HINT)).toBe('Hinweis');
    expect(escalationLevelShort(EscalationLevel.FRAME)).toBe('Stufe 3');
  });

  it('shows hud on focus or hint+', () => {
    expect(shouldShowHud(EscalationLevel.OBSERVE, 0, true)).toBe(true);
    expect(shouldShowHud(EscalationLevel.OBSERVE, 0, false)).toBe(false);
    expect(shouldShowHud(EscalationLevel.HINT, 0, false)).toBe(true);
    expect(shouldShowHud(EscalationLevel.OBSERVE, 1, false)).toBe(true);
  });
});
