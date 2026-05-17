/**
 * Lädt Impulse/Threads → BubbleKnowledgeSnapshot + Sortier-Puls.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import {
  buildBubbleKnowledge,
  detectSortHighlightRegion,
  type BubbleKnowledgeSnapshot,
} from '../components/Bubble/bubbleKnowledge';
import { loadAllThreads } from '../services/thought-processor';

const SORT_PULSE_MS = 2200;

export function useBubbleKnowledge(refreshKey = 0) {
  const { impulseRepo, threadRepo } = useAppServices();
  const [knowledge, setKnowledge] = useState<BubbleKnowledgeSnapshot | null>(null);
  const [working, setWorking] = useState(false);
  const [sortHighlightRegion, setSortHighlightRegion] = useState<number | null>(null);
  const prevRef = useRef<BubbleKnowledgeSnapshot | null>(null);
  const sortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    const impulses = await impulseRepo.findRecent(120);
    const threads = await loadAllThreads(threadRepo);
    const next = buildBubbleKnowledge(impulses, threads);
    const highlight = detectSortHighlightRegion(prevRef.current, next);
    prevRef.current = next;
    setKnowledge(next);
    if (highlight !== null) {
      setSortHighlightRegion(highlight);
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
      sortTimerRef.current = setTimeout(() => {
        setSortHighlightRegion(null);
        sortTimerRef.current = null;
      }, SORT_PULSE_MS);
    }
  }, [impulseRepo, threadRepo]);

  useEffect(() => {
    void reload();
    return () => {
      if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    };
  }, [refreshKey, reload]);

  const runWithWorking = useCallback(
    async (fn: () => Promise<void>) => {
      setWorking(true);
      try {
        await fn();
        await reload();
      } finally {
        setWorking(false);
      }
    },
    [reload],
  );

  return {
    knowledge,
    working,
    sortHighlightRegion,
    setWorking,
    reload,
    runWithWorking,
  };
}
