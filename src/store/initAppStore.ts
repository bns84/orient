/**
 * Lädt App-Store aus SQLite + KV (Onboarding)
 */

import type { LocalDatabase } from '../infrastructure/storage/LocalDatabase';
import { AppProfileRepositoryLocal } from '../infrastructure/storage/AppProfileRepository.local';
import { loadOnboardingProfile } from '../profile/onboardingProfile';
import { bindAppProfilePersistence, useAppStore } from './useAppStore';
import { DEFAULT_APP_PROFILE } from './types';

export async function initAppStore(db: LocalDatabase): Promise<void> {
  const repo = new AppProfileRepositoryLocal(db);
  bindAppProfilePersistence((snapshot) => repo.save(snapshot));

  const [stored, kv] = await Promise.all([repo.load(), loadOnboardingProfile()]);

  useAppStore.getState().hydrate({
    presence: stored?.presence ?? DEFAULT_APP_PROFILE.presence,
    companionName: stored?.companionName ?? kv.companionName ?? DEFAULT_APP_PROFILE.companionName,
    onboardingComplete: stored?.onboardingComplete ?? kv.complete,
    currentMood: stored?.currentMood ?? DEFAULT_APP_PROFILE.currentMood,
    activeContextId: stored?.activeContextId,
  });
}
