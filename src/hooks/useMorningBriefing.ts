import { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { useAppStore } from '../store/useAppStore';
import {
  buildMorningBriefingLines,
  markMorningBriefingShown,
  shouldShowMorningBriefing,
  touchSessionActivity,
} from '../services/morning-briefing';

export function useMorningBriefing(enabled: boolean) {
  const services = useAppServices();
  const companionName = useAppStore((s) => s.companionName);
  const [lines, setLines] = useState<string[] | null>(null);
  const [ready, setReady] = useState(false);

  const dismiss = useCallback(async () => {
    await markMorningBriefingShown();
    await touchSessionActivity();
    setLines(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return;
    }

    let alive = true;
    void (async () => {
      const show = await shouldShowMorningBriefing();
      if (!alive) return;

      if (show) {
        const briefing = await buildMorningBriefingLines({
          companionName,
          impulseRepo: services.impulseRepo,
          threadRepo: services.threadRepo,
        });
        if (!alive) return;
        setLines(briefing);
      } else {
        await touchSessionActivity();
      }
      setReady(true);
    })();

    return () => {
      alive = false;
    };
  }, [enabled, companionName, services.impulseRepo, services.threadRepo]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void touchSessionActivity();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled]);

  return { lines, ready, dismiss, visible: lines !== null && lines.length > 0 };
}
