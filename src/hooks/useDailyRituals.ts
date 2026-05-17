/**
 * Morgen- und Abendritual — sequentiell, ohne Race um session.lastActiveAt.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { kvGet } from '../db/kv';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { useAppStore } from '../store/useAppStore';
import {
  buildMorningBriefingLines,
  markMorningBriefingShown,
  shouldShowMorningBriefing,
  touchSessionActivity,
} from '../services/morning-briefing';
import {
  buildEveningRitualLine,
  dismissEveningRitual,
  EVENING_AUTO_DISMISS_MS,
  shouldShowEveningRitual,
} from '../services/evening-ritual';

type RitualPhase = 'loading' | 'morning' | 'evening' | 'none';

export function useDailyRituals(enabled: boolean) {
  const services = useAppServices();
  const companionName = useAppStore((s) => s.companionName);
  const [phase, setPhase] = useState<RitualPhase>(enabled ? 'loading' : 'none');
  const [morningLines, setMorningLines] = useState<string[] | null>(null);
  const [eveningLine, setEveningLine] = useState<string | null>(null);
  const eveningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<RitualPhase>(phase);
  phaseRef.current = phase;

  const clearEveningTimer = useCallback(() => {
    if (eveningTimerRef.current) {
      clearTimeout(eveningTimerRef.current);
      eveningTimerRef.current = null;
    }
  }, []);

  const dismissMorning = useCallback(async () => {
    await markMorningBriefingShown();
    await touchSessionActivity();
    setMorningLines(null);
    setPhase('none');
  }, []);

  const dismissEvening = useCallback(async () => {
    clearEveningTimer();
    await dismissEveningRitual();
    setEveningLine(null);
    setPhase('none');
  }, [clearEveningTimer]);

  const notifyEngagement = useCallback(() => {
    if (phaseRef.current !== 'evening') return;
    void dismissEvening();
  }, [dismissEvening]);

  useEffect(() => {
    if (!enabled) {
      setPhase('none');
      return;
    }

    let alive = true;
    void (async () => {
      const now = new Date();
      const lastActive = await kvGet<number>('session.lastActiveAt', 0);

      if (await shouldShowMorningBriefing(now)) {
        const lines = await buildMorningBriefingLines({
          companionName,
          impulseRepo: services.impulseRepo,
          threadRepo: services.threadRepo,
          now,
        });
        if (!alive) return;
        setMorningLines(lines);
        setPhase('morning');
        return;
      }

      if (await shouldShowEveningRitual(now, lastActive)) {
        if (!alive) return;
        setEveningLine(buildEveningRitualLine(companionName));
        setPhase('evening');
        return;
      }

      await touchSessionActivity(now);
      if (!alive) return;
      setPhase('none');
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

  useEffect(() => {
    if (phase !== 'evening') {
      clearEveningTimer();
      return;
    }

    eveningTimerRef.current = setTimeout(() => {
      void dismissEvening();
    }, EVENING_AUTO_DISMISS_MS);

    return clearEveningTimer;
  }, [phase, dismissEvening, clearEveningTimer]);

  return {
    ready: phase !== 'loading',
    morning: {
      lines: morningLines,
      visible: phase === 'morning' && morningLines !== null && morningLines.length > 0,
      dismiss: dismissMorning,
    },
    evening: {
      line: eveningLine,
      visible: phase === 'evening' && eveningLine !== null,
      dismiss: dismissEvening,
      notifyEngagement,
    },
  };
}
