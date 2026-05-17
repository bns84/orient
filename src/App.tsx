/**
 * ORIENT - Main App Component
 */

import React, { useCallback, useEffect, useState } from 'react';
import { OnboardingFlow } from './pages/Onboarding/OnboardingFlow';
import { HomeScreen } from './pages/Home/HomeScreen';
import { loadOnboardingProfile } from './profile/onboardingProfile';
import { usePresenceSync } from './hooks/usePresenceSync';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  usePresenceSync(!showOnboarding);

  useEffect(() => {
    void (async () => {
      const profile = await loadOnboardingProfile();
      setShowOnboarding(!profile.complete);
      setOnboardingChecked(true);
    })();
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    const profile = await loadOnboardingProfile();
    useAppStore.getState().hydrate({
      onboardingComplete: true,
      companionName: profile.companionName ?? 'ORIENT',
    });
    setShowOnboarding(false);
  }, []);

  if (!onboardingChecked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary, #010208)',
        }}
      />
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => void handleOnboardingComplete()} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #010208)',
      }}
    >
      <HomeScreen />
    </div>
  );
}
