/**
 * Swipe-Navigation für den Hauptscreen (main ↔ topics ↔ detail).
 */

import { useCallback, useRef, useState } from 'react';

export type HomePanel = 'main' | 'topics' | 'detail';

const SWIPE_MIN_PX = 56;
const SWIPE_MAX_CROSS_AXIS = 72;

export function resolveSwipeTransition(
  panel: HomePanel,
  dx: number,
  dy: number,
): HomePanel | null {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (panel === 'main') {
    if (dx > SWIPE_MIN_PX && absY < SWIPE_MAX_CROSS_AXIS) return 'topics';
    if (dy > SWIPE_MIN_PX && absX < SWIPE_MAX_CROSS_AXIS) return 'detail';
    return null;
  }

  if (panel === 'topics') {
    if (dx < -SWIPE_MIN_PX && absY < SWIPE_MAX_CROSS_AXIS) return 'main';
    if (dy > SWIPE_MIN_PX && absX < SWIPE_MAX_CROSS_AXIS) return 'detail';
    return null;
  }

  if (panel === 'detail') {
    if (dy < -SWIPE_MIN_PX && absX < SWIPE_MAX_CROSS_AXIS) return 'main';
    return null;
  }

  return null;
}

type TouchPoint = { x: number; y: number };

export function useSwipePanels(initial: HomePanel = 'main') {
  const [panel, setPanel] = useState<HomePanel>(initial);
  const startRef = useRef<TouchPoint | null>(null);

  const goMain = useCallback(() => setPanel('main'), []);
  const goTopics = useCallback(() => setPanel('topics'), []);
  const goDetail = useCallback(() => setPanel('detail'), []);

  const isScrollableTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('.home-detail-sheet, .home-topics'));
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isScrollableTarget(e.target)) return;
    const t = e.changedTouches[0];
    if (!t) return;
    startRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isScrollableTarget(e.target)) {
      startRef.current = null;
      return;
    }
    const start = startRef.current;
    startRef.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const next = resolveSwipeTransition(panel, dx, dy);
    if (next) setPanel(next);
  }, [panel]);

  return {
    panel,
    setPanel,
    goMain,
    goTopics,
    goDetail,
    onTouchStart,
    onTouchEnd,
  };
}
