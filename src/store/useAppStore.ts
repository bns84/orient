/**
 * ORIENT — Zentraler UI-/Präsenz-Store (Zustand)
 */

import { create } from 'zustand';
import type { BehaviorState } from '../behavior/types';
import { sessionMoodToAppMood } from './moodMapping';
import {
  type AppMood,
  type AppProfileSnapshot,
  type PresenceState,
  DEFAULT_APP_PROFILE,
} from './types';

type PersistFn = (snapshot: AppProfileSnapshot) => Promise<void>;

let persistFn: PersistFn | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let presenceRestTimer: ReturnType<typeof setTimeout> | null = null;

export function bindAppProfilePersistence(fn: PersistFn): void {
  persistFn = fn;
}

function schedulePersist(snapshot: AppProfileSnapshot): void {
  if (!persistFn) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persistFn?.(snapshot);
  }, 200);
}

function snapshotFromState(state: AppStoreState): AppProfileSnapshot {
  return {
    presence: state.presence,
    companionName: state.companionName,
    onboardingComplete: state.onboardingComplete,
    currentMood: state.currentMood,
    activeContextId: state.activeContextId,
  };
}

type AppStoreState = {
  hydrated: boolean;
  presence: PresenceState;
  companionName: string;
  onboardingComplete: boolean;
  currentMood: AppMood;
  activeContextId?: string;

  hydrate: (snapshot: Partial<AppProfileSnapshot>) => void;
  setPresence: (presence: PresenceState, options?: { hold?: boolean }) => void;
  pulsePresence: (presence: PresenceState, ms?: number) => void;
  setCompanionName: (name: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setCurrentMood: (mood: AppMood) => void;
  setActiveContextId: (id: string | undefined) => void;
  syncMoodFromBehavior: (behavior: BehaviorState) => void;
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  hydrated: false,
  ...DEFAULT_APP_PROFILE,

  hydrate: (partial) => {
    set({
      hydrated: true,
      presence: partial.presence ?? DEFAULT_APP_PROFILE.presence,
      companionName: partial.companionName ?? DEFAULT_APP_PROFILE.companionName,
      onboardingComplete: partial.onboardingComplete ?? DEFAULT_APP_PROFILE.onboardingComplete,
      currentMood: partial.currentMood ?? DEFAULT_APP_PROFILE.currentMood,
      activeContextId: partial.activeContextId,
    });
  },

  setPresence: (presence, options) => {
    set({ presence });
    schedulePersist(snapshotFromState(get()));
    if (!options?.hold && presence !== 'rest' && presenceRestTimer === null) {
      // caller should use pulsePresence for transient states
    }
  },

  pulsePresence: (presence, ms = 1400) => {
    if (presenceRestTimer) {
      clearTimeout(presenceRestTimer);
      presenceRestTimer = null;
    }
    set({ presence });
    schedulePersist(snapshotFromState(get()));
    if (presence !== 'rest') {
      presenceRestTimer = setTimeout(() => {
        presenceRestTimer = null;
        set({ presence: 'rest' });
        schedulePersist(snapshotFromState(get()));
      }, ms);
    }
  },

  setCompanionName: (companionName) => {
    set({ companionName });
    schedulePersist(snapshotFromState(get()));
  },

  setOnboardingComplete: (onboardingComplete) => {
    set({ onboardingComplete });
    schedulePersist(snapshotFromState(get()));
  },

  setCurrentMood: (currentMood) => {
    set({ currentMood });
    schedulePersist(snapshotFromState(get()));
  },

  setActiveContextId: (activeContextId) => {
    set({ activeContextId });
    schedulePersist(snapshotFromState(get()));
  },

  syncMoodFromBehavior: (behavior) => {
    const next = sessionMoodToAppMood(behavior.sessionMood);
    if (get().currentMood === next) return;
    set({ currentMood: next });
    schedulePersist(snapshotFromState(get()));
  },
}));
