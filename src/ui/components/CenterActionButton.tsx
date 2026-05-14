/**
 * ORIENT - Center Action Button
 * 
 * Platzhalter für „tap" und später „press & hold to talk".
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfach, klar)
 * - Stille ist ein Feature
 */

import React, { useRef } from 'react';

type Props = {
  onTap?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
};

export const CenterActionButton: React.FC<Props> = ({ onTap, onHoldStart, onHoldEnd }) => {
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    holdTimerRef.current = setTimeout(() => onHoldStart?.(), 250);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    onHoldEnd?.();
  };

  return (
    <button
      onClick={onTap}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      style={{
        width: 72,
        height: 72,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        color: 'white',
        fontSize: 14,
        cursor: 'pointer',
      }}
      aria-label="Orient Action"
    >
      ●
    </button>
  );
};
