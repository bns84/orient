/**
 * ORIENT - Visual Debug Canvas
 * 
 * Canvas-2D Debug: Punkte + Linien.
 * (Keine Optik-Diskussion, nur Sichtbarkeit.)
 * 
 * Respektiert ORIENT_DNA:
 * - Jeder visuelle Effekt ist ableitbar aus Daten
 * - Kein "intelligent aussehendes Wabern ohne Grund"
 */

import React, { useEffect, useRef } from 'react';
import { VisualState } from '../../visual/kernel/VisualState';

type Props = { state: VisualState | null };

export const VisualDebugCanvas: React.FC<Props> = ({ state }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Background (ruhig)
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, w, h);

    if (!state) return;

    const cx = w / 2;
    const cy = h / 2;

    // Edges
    for (const e of state.edges) {
      const a = state.nodes.find((n) => n.id === e.from);
      const b = state.nodes.find((n) => n.id === e.to);
      if (!a || !b) continue;

      ctx.globalAlpha = Math.max(0.05, e.opacity);
      ctx.lineWidth = 1 + e.thickness * 3;

      ctx.beginPath();
      ctx.moveTo(cx + a.position.x * 120, cy + a.position.y * 120);
      ctx.lineTo(cx + b.position.x * 120, cy + b.position.y * 120);
      ctx.strokeStyle = '#cfd3ff';
      ctx.stroke();
    }

    // Nodes
    for (const n of state.nodes) {
      const r = 4 + n.size * 10;

      ctx.globalAlpha = Math.max(0.2, n.opacity);
      ctx.beginPath();
      ctx.arc(cx + n.position.x * 120, cy + n.position.y * 120, r, 0, Math.PI * 2);
      ctx.fillStyle = n.color || '#4EA8DE';
      ctx.fill();

      // Glow dot
      ctx.globalAlpha = Math.max(0.1, n.intensity);
      ctx.beginPath();
      ctx.arc(cx + n.position.x * 120, cy + n.position.y * 120, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = n.color || '#4EA8DE';
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, [state]);

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%', borderRadius: 24, display: 'block' }}
    />
  );
};
