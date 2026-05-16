/**
 * ORIENT — 3D-Präsenz-Bubble (Jarvis-Ästhetik)
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { PresenceState } from '../../store/types';
import { NeuralNetworkScene } from './NeuralNetworkScene';

export type OrientBubbleProps = {
  state?: PresenceState;
  width?: number;
  height?: number;
  className?: string;
};

export function OrientBubble({
  state = 'rest',
  width = 120,
  height = 120,
  className,
}: OrientBubbleProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#000',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 60, position: [0, 0, 5] }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <NeuralNetworkScene state={state} />
        </Suspense>
      </Canvas>
    </div>
  );
}
