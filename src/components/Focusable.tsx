/**
 * ORIENT - Focusable Component
 * 
 * Tap to focus/zoom with overlay + ESC/Outside close.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfache Interaktion)
 * - Transparenz (persistiert openId)
 */

import React, { useCallback, useMemo, useState } from 'react';
import { kvGet, kvSet } from '../db/kv';
import { useEscClose } from '../hooks/useEscClose';
import { logEvent } from '../db/events';

type Props = {
  id: string;
  title?: string;
  persistKey?: string; // optional override
  children: React.ReactNode;
  className?: string;
};

type FocusState = { openId: string | null };

export function Focusable({
  id,
  children,
  className,
  persistKey = 'ui.focus',
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const lastTapRef = React.useRef<number>(0);

  // lazy restore once per mount (simple; keep minimal)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const s = await kvGet<FocusState>(persistKey, { openId: null });
      if (!alive) return;
      setOpenId(s.openId);
    })();
    return () => {
      alive = false;
    };
  }, [persistKey]);

  const isOpen = openId === id;

  const open = useCallback(async () => {
    setOpenId(id);
    await kvSet<FocusState>(persistKey, { openId: id });
    await logEvent('ui.focus.open', { id });
  }, [id, persistKey]);

  const close = useCallback(async () => {
    if (locked) return; // Don't close if locked
    setOpenId(null);
    setLocked(false);
    await kvSet<FocusState>(persistKey, { openId: null });
    await logEvent('ui.focus.close', { id });
  }, [id, persistKey, locked]);

  const toggleLock = useCallback(async () => {
    const newLocked = !locked;
    setLocked(newLocked);
    await logEvent(newLocked ? 'ui.focus.lock' : 'ui.focus.unlock', { id });
  }, [id, locked]);

  const handleTap = useCallback(async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      // Double-tap detected
      await toggleLock();
    } else {
      // Single-tap
      if (!isOpen) {
        await open();
      }
    }
    lastTapRef.current = now;
  }, [isOpen, open, toggleLock]);

  useEscClose(isOpen, close);

  const overlay = useMemo(() => {
    if (!isOpen) return null;
    return (
      <div
        onPointerDown={locked ? undefined : close}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          cursor: locked ? 'default' : 'pointer',
        }}
      />
    );
  }, [isOpen, close, locked]);

  return (
    <>
      {overlay}

      <div
        onClick={handleTap}
        className={className}
        style={{
          cursor: 'pointer',
          position: 'relative',
          zIndex: isOpen ? 1000 : 'auto',
          transform: isOpen ? 'translate3d(0,0,0) scale(1.04)' : 'none',
          opacity: isOpen ? 1 : 1,
          transition: 'transform 220ms ease, opacity 200ms ease',
        }}
      >
        {/* normal */}
        {!isOpen && children}

        {/* focused clone */}
        {isOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => {
              // Scroll-Guard: prevent scroll-through to overlay
              e.stopPropagation();
            }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(1.00)',
              width: 'min(920px, calc(100vw - 40px))',
              maxHeight: 'min(80vh, 920px)',
              overflow: 'auto',
              borderRadius: 18,
              zIndex: 1000,
              boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
              background: '#0b0d12',
            }}
          >
            <div
              style={{
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {locked && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>🔒 Locked (double-tap to unlock)</div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {locked && (
                  <button
                    onClick={toggleLock}
                    style={{
                      borderRadius: 12,
                      padding: '8px 12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Unlock
                  </button>
                )}
                <button
                  onClick={close}
                  style={{
                    borderRadius: 12,
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ padding: 16 }}>{children}</div>
          </div>
        )}
      </div>
    </>
  );
}
