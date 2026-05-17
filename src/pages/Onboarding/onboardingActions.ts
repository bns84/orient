import { useAppStore } from '../../store/useAppStore';
import { logEvent } from '../../db/events';
import { saveOnboardingProfile, type OnboardingProfile } from '../../profile/onboardingProfile';

export async function finishOnboarding(profile: OnboardingProfile): Promise<void> {
  await saveOnboardingProfile({ ...profile, complete: true, interests: [] });
  useAppStore.getState().hydrate({
    onboardingComplete: true,
    companionName: profile.companionName ?? 'ORIENT',
  });
  await logEvent('onboarding.complete', {
    path: profile.path,
    style: profile.communicationStyle ?? 'unknown',
  });
}
