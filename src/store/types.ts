/**
 * ORIENT — App-Store Typen (Präsenz & Profil)
 */

export type PresenceState =
  | 'rest'
  | 'listen'
  | 'think'
  | 'emotion'
  | 'connect'
  | 'ready';

export type AppMood = 'aktiv' | 'fokussiert' | 'müde' | 'neugierig' | 'ruhe';

export type AppProfileSnapshot = {
  presence: PresenceState;
  companionName: string;
  onboardingComplete: boolean;
  currentMood: AppMood;
  activeContextId?: string;
};

export const DEFAULT_APP_PROFILE: AppProfileSnapshot = {
  presence: 'rest',
  companionName: 'ORIENT',
  onboardingComplete: false,
  currentMood: 'ruhe',
};
