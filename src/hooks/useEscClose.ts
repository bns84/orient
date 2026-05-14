/**
 * ORIENT - ESC Close Hook
 * 
 * Schließt bei ESC-Taste.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (einfach, klar)
 */

import { useEffect } from 'react';

export function useEscClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);
}
