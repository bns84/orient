import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryLocalDatabase } from '@infrastructure/storage/MemoryLocalDatabase';
import { AppProfileRepositoryLocal } from '@infrastructure/storage/AppProfileRepository.local';
import { bindAppProfilePersistence, useAppStore } from '../../../src/store/useAppStore';
import { sessionMoodToAppMood } from '../../../src/store/moodMapping';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      hydrated: false,
      presence: 'rest',
      companionName: 'ORIENT',
      onboardingComplete: false,
      currentMood: 'ruhe',
      activeContextId: undefined,
    });
    bindAppProfilePersistence(async () => {});
  });

  it('maps behavior session mood to app mood', () => {
    expect(sessionMoodToAppMood('focused')).toBe('fokussiert');
    expect(sessionMoodToAppMood('tired')).toBe('müde');
  });

  it('persists profile snapshot to SQLite repository', async () => {
    const db = new MemoryLocalDatabase();
    const repo = new AppProfileRepositoryLocal(db);
    bindAppProfilePersistence((snap) => repo.save(snap));

    useAppStore.getState().hydrate({
      companionName: 'Lumen',
      onboardingComplete: true,
      presence: 'listen',
      currentMood: 'neugierig',
    });
    useAppStore.getState().setCompanionName('Lumen');

    await new Promise((r) => setTimeout(r, 300));

    const loaded = await repo.load();
    expect(loaded?.companionName).toBe('Lumen');
    expect(loaded?.presence).toBe('listen');
  });
});
