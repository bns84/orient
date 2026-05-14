/**
 * ORIENT - Debug Only Wrapper
 * 
 * Zeigt Children nur im Debug-Modus an.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (Debug standardmäßig unsichtbar)
 */

import React from 'react';
import { isDebugEnabled } from './isDebug';

type Props = {
  children: React.ReactNode;
};

export function DebugOnly({ children }: Props) {
  if (!isDebugEnabled()) return null;
  return <>{children}</>;
}
