/**
 * ORIENT - Behavior Policies
 * 
 * Weiche Heuristiken (keine KI).
 * Alle Outputs sind Tendenzen.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (weiche Übergänge)
 * - Transparenz (alle Regeln nachvollziehbar)
 */

import { BehaviorInputs, BehaviorState, PresentationHints } from './types';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function timeBucket(h: number): BehaviorState['timeOfDay'] {
  if (h >= 6 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

export function deriveState(prev: BehaviorState | null, inp: BehaviorInputs): BehaviorState {
  const d = new Date(inp.now);
  const tod = timeBucket(d.getHours());

  // raw signals
  const activity = clamp01(inp.eventsLast60s / 20); // 20 events/min => 1.0
  const switching = clamp01(inp.focusSwitchesLast60s / 8); // 8 switches/min => scattered
  const tempo = clamp01((inp.eventsLast60s + inp.holdsLast60s) / 22);
  const depth = clamp01(inp.scrollDepthLast60s); // already 0..1
  const speaking = clamp01(inp.speechSecondsLast60s / 20); // 20s speaking/min => 1.0
  const aborts = clamp01(inp.abortsLast60s / 4);

  // derived
  const focus = clamp01(depth * 0.6 + (1 - switching) * 0.4);
  const scatteredness = clamp01(switching * 0.7 + aborts * 0.3);
  const curiosity = clamp01(activity * 0.5 + (1 - depth) * 0.3 + speaking * 0.2);

  // fatigue: late day + low activity + short interactions
  const late = tod === 'night' ? 1 : tod === 'evening' ? 0.6 : 0.2;
  const fatigue = clamp01(late * 0.6 + (1 - activity) * 0.25 + aborts * 0.15);

  // smooth
  const smooth = (a: number, b: number, k = 0.25) => (prev ? (1 - k) * a + k * b : b);

  const next: BehaviorState = {
    activityLevel: smooth(prev?.activityLevel ?? 0, activity),
    focusLevel: smooth(prev?.focusLevel ?? 0, focus),
    tempo: smooth(prev?.tempo ?? 0, tempo),
    fatigue: smooth(prev?.fatigue ?? 0, fatigue),
    curiosity: smooth(prev?.curiosity ?? 0, curiosity),
    scatteredness: smooth(prev?.scatteredness ?? 0, scatteredness),
    timeOfDay: tod,
    sessionMood: 'neutral',
    updatedAt: inp.now,
  };

  // mood selection (soft, for wording/tone decisions later)
  const f = next.focusLevel;
  const s = next.scatteredness;
  const t = next.fatigue;
  const c = next.curiosity;

  if (t > 0.65 && f < 0.5) next.sessionMood = 'tired';
  else if (f > 0.7 && s < 0.35) next.sessionMood = 'focused';
  else if (s > 0.6) next.sessionMood = 'scattered';
  else if (c > 0.6) next.sessionMood = 'curious';
  else next.sessionMood = 'neutral';

  return next;
}

export function derivePresentationHints(state: BehaviorState): PresentationHints {
  // topicCount
  const base = state.timeOfDay === 'morning' ? 5 : state.timeOfDay === 'night' ? 2 : 4;
  const reduceForFatigue = Math.round(state.fatigue * 2); // 0..2
  const reduceForFocus = state.focusLevel > 0.7 ? 1 : 0;
  const addForCuriosity = state.curiosity > 0.7 ? 1 : 0;

  let topicCount = base - reduceForFatigue - reduceForFocus + addForCuriosity;
  topicCount = Math.max(2, Math.min(6, topicCount));

  // density
  const density =
    state.fatigue > 0.65
      ? 'low'
      : state.focusLevel > 0.7
        ? 'high'
        : 'medium';

  // audio vs visual
  const preferAudio = clamp01(
    state.fatigue * 0.55 + state.scatteredness * 0.25 + (1 - state.focusLevel) * 0.2,
  );
  const preferVisualCards = clamp01(
    state.curiosity * 0.6 + state.focusLevel * 0.2 + (1 - state.fatigue) * 0.2,
  );

  // nudge: only when scattered OR tired (but gentle)
  const nudgeLevel: 0 | 1 | 2 =
    state.scatteredness > 0.7
      ? 2
      : state.scatteredness > 0.5 || state.fatigue > 0.7
        ? 1
        : 0;

  const tone =
    state.focusLevel > 0.7 ? 'crisp' : state.fatigue > 0.7 ? 'warm' : 'neutral';

  return { preferAudio, preferVisualCards, topicCount, density, nudgeLevel, tone };
}
