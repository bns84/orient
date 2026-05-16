import { createTopicFromPrompt } from '../../db/topics';
import { logEvent } from '../../db/events';
import { ThreadStatus } from '../../core/threads/ThreadStatus';
import type { AppServices } from '../../ui/wiring/AppServicesContext';
import { saveOnboardingProfile, type OnboardingProfile } from '../../profile/onboardingProfile';
import { ContextMode } from '../../core/escalation/ContextMode';

export async function finishOnboarding(
  services: AppServices,
  profile: OnboardingProfile,
): Promise<void> {
  const now = new Date();

  for (const title of profile.interests) {
    const row = await createTopicFromPrompt(title, 'manual');
    await services.threadRepo.save({
      id: row.key,
      title: row.title,
      status: ThreadStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      tags: [title.toLowerCase()],
      metrics: {
        recencyScore: 0.5,
        frequencyScore: 0.2,
        confidenceScore: 0.3,
        userRelevanceScore: 0.7,
      },
    });
  }

  await saveOnboardingProfile({ ...profile, complete: true });
  await logEvent('onboarding.complete', { path: profile.path, interests: profile.interests.length });
}

export async function captureFirstThought(
  services: AppServices,
  text: string,
  threadId?: string,
): Promise<void> {
  const ctx = await services.contextService.getCurrent();
  await services.captureImpulse.execute(
    { text: text.trim(), threadId },
    { contextMode: ctx.mode ?? ContextMode.NORMAL, timestamp: new Date() },
  );
}
