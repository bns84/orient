import type { PresenceState } from '../../store/types';

/** Progressive Netz-Dichte + aktive Regionen pro Präsenz-Zustand */
export const PRESENCE_STATE_CONFIG: Record<
  PresenceState,
  { activation: number; activeRegions: number[] }
> = {
  rest: { activation: 0.12, activeRegions: [] },
  listen: { activation: 0.28, activeRegions: [2] },
  think: { activation: 0.48, activeRegions: [3] },
  emotion: { activation: 0.42, activeRegions: [0] },
  connect: { activation: 0.58, activeRegions: [4, 5] },
  ready: { activation: 1.0, activeRegions: [0, 1, 2, 3, 4, 5, 6, 7] },
};
