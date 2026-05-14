/**
 * ORIENT - Behavior Simulation
 * 
 * Nur für Debug: Tick alle 1s, ohne UI-Features.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (1s Interval, nicht zu häufig)
 */

import { behaviorTick } from './engine';

export function startBehaviorSimulation(intervalMs = 1000) {
  const t = window.setInterval(() => {
    behaviorTick(Date.now());
  }, intervalMs);

  return () => window.clearInterval(t);
}
