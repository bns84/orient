/**
 * ORIENT - Behavior Engine
 * 
 * State-Holding + Snapshot.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (weiche Zustände)
 * - Transparenz (Zustände sind ableitbar)
 */

import { BehaviorState, PresentationHints } from './types';
import { readBehaviorInputs } from './sensors';
import { derivePresentationHints, deriveState } from './policies';

let state: BehaviorState | null = null;
let hints: PresentationHints | null = null;

export function behaviorTick(now = Date.now()) {
  const inp = readBehaviorInputs(now);
  state = deriveState(state, inp);
  hints = derivePresentationHints(state);
  return { state, hints, inputs: inp };
}

export function getBehaviorState() {
  return state;
}

export function getPresentationHints() {
  return hints;
}
