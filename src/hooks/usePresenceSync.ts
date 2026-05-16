/**
 * Verknüpft Behavior-Engine → App-Store (Mood) und hält Präsenz-Ruhe
 */

import { useEffect } from 'react';
import { behaviorTick } from '../behavior/engine';
import { useAppStore } from '../store/useAppStore';

export function usePresenceSync(enabled = true): void {
  const hydrated = useAppStore((s) => s.hydrated);
  const syncMoodFromBehavior = useAppStore((s) => s.syncMoodFromBehavior);

  useEffect(() => {
    if (!enabled || !hydrated) return;

    const tick = () => {
      const { state } = behaviorTick();
      if (state) syncMoodFromBehavior(state);
    };

    tick();
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [enabled, hydrated, syncMoodFromBehavior]);
}
