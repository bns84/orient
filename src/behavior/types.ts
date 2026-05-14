/**
 * ORIENT - Behavior Types
 * 
 * Weiche Zustände und Präsentations-Hints.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (weiche Zustände, keine harten Modi)
 * - Transparenz (Zustände sind ableitbar, nicht Blackbox)
 */

export type SessionMood = 'neutral' | 'curious' | 'focused' | 'scattered' | 'tired';

export type BehaviorState = {
  // soft signals 0..1
  activityLevel: number; // how active user is (events per minute, recency)
  focusLevel: number; // stability of attention (dwell, low switching)
  tempo: number; // interaction tempo (rapid taps/swipes)
  fatigue: number; // inferred tiredness
  curiosity: number; // broad exploration tendency
  scatteredness: number; // frequent switching / aborts

  // meta
  timeOfDay: 'morning' | 'day' | 'evening' | 'night';
  sessionMood: SessionMood;
  updatedAt: number;
};

export type BehaviorInputs = {
  now: number;

  // event-derived signals (rolling window)
  eventsLast60s: number;
  focusSwitchesLast60s: number;
  scrollDepthLast60s: number; // 0..1 (approx)
  holdsLast60s: number; // press&hold count
  abortsLast60s: number; // e.g. hold without save, close quickly

  // optional speech proxy (no transcript stored)
  speechSecondsLast60s: number; // duration only
  speechEnergyLast60s: number; // 0..1 proxy (volume/peaks if available; else 0.5)
};

export type PresentationHints = {
  // what ORIENT should prefer RIGHT NOW
  preferAudio: number; // 0..1
  preferVisualCards: number; // 0..1
  topicCount: number; // 2..6
  density: 'low' | 'medium' | 'high'; // how dense content should be
  nudgeLevel: 0 | 1 | 2; // 0 none, 1 gentle, 2 gentle+structured
  tone: 'warm' | 'neutral' | 'crisp';
};
