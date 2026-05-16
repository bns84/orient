import type { CSSProperties } from 'react';
import type { PresenceState } from './types';

export function presenceOrbStyle(state: PresenceState): CSSProperties {
  const base: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 999,
    transition: 'box-shadow 0.6s ease, background 0.6s ease, border-color 0.6s ease',
  };

  switch (state) {
    case 'listen':
      return {
        ...base,
        border: '1px solid rgba(120,180,255,0.45)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(120,180,255,0.35), rgba(10,12,20,0.9))',
        boxShadow: '0 0 24px rgba(80,140,255,0.25)',
      };
    case 'think':
      return {
        ...base,
        border: '1px solid rgba(180,140,255,0.4)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(160,140,255,0.3), rgba(10,12,20,0.9))',
        boxShadow: '0 0 20px rgba(140,120,255,0.2)',
      };
    case 'emotion':
      return {
        ...base,
        border: '1px solid rgba(255,160,100,0.45)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(255,140,80,0.35), rgba(10,12,20,0.9))',
        boxShadow: '0 0 22px rgba(255,120,60,0.22)',
      };
    case 'connect':
      return {
        ...base,
        border: '1px solid rgba(140,220,200,0.4)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(120,200,180,0.28), rgba(10,12,20,0.9))',
        boxShadow: '0 0 18px rgba(100,200,160,0.18)',
      };
    case 'ready':
      return {
        ...base,
        border: '1px solid rgba(220,190,120,0.5)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(220,190,100,0.35), rgba(10,12,20,0.9))',
        boxShadow: '0 0 26px rgba(220,180,80,0.28)',
      };
    case 'rest':
    default:
      return {
        ...base,
        border: '1px solid rgba(255,255,255,0.18)',
        background:
          'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25) inset',
      };
  }
}
