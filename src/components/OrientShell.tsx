/**
 * ORIENT - Shell Component
 * 
 * One-Column Layout-Container für ORIENT.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (sauberer Flow)
 * - Companion-Gefühl (nicht Dev-Tool)
 */

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function OrientShell({ children }: Props) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}
