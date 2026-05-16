/**
 * Onboarding- & Profil-State (local-first, Dexie KV)
 */

import { kvGet, kvSet } from '../db/kv';

export type OnboardingPath = 'skip' | 'short' | 'deep';
export type CommunicationStyle = 'active' | 'passive';

export type OnboardingProfile = {
  complete: boolean;
  path?: OnboardingPath;
  companionName?: string;
  communicationStyle?: CommunicationStyle;
  interests: string[];
};

const DEFAULT: OnboardingProfile = {
  complete: false,
  interests: [],
};

export async function loadOnboardingProfile(): Promise<OnboardingProfile> {
  const complete = await kvGet<boolean>('onboarding.complete', false);
  const path = await kvGet<OnboardingPath | undefined>('onboarding.path', undefined);
  const companionName = await kvGet<string | undefined>('profile.companionName', undefined);
  const communicationStyle = await kvGet<CommunicationStyle | undefined>(
    'profile.communicationStyle',
    undefined,
  );
  const interests = await kvGet<string[]>('profile.interests', []);
  return { complete, path, companionName, communicationStyle, interests };
}

export async function saveOnboardingProfile(profile: OnboardingProfile): Promise<void> {
  await kvSet('onboarding.complete', profile.complete);
  if (profile.path) await kvSet('onboarding.path', profile.path);
  if (profile.companionName) await kvSet('profile.companionName', profile.companionName);
  if (profile.communicationStyle) {
    await kvSet('profile.communicationStyle', profile.communicationStyle);
  }
  await kvSet('profile.interests', profile.interests);
}

export async function getCompanionName(): Promise<string | undefined> {
  return kvGet<string | undefined>('profile.companionName', undefined);
}
