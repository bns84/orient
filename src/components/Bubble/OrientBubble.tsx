/**
 * ORIENT — 3D-Präsenz-Bubble (Jarvis-Ästhetik)
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { ContextMode } from '../../core/escalation/ContextMode';
import type { EscalationLevel } from '../../core/escalation/EscalationLevel';
import type { PresenceState } from '../../store/types';
import type { BubbleKnowledgeSnapshot } from './bubbleKnowledge';
import { BubbleErrorBoundary } from './BubbleErrorBoundary';
import { NeuralNetworkScene } from './NeuralNetworkScene';

export type OrientBubbleProps = {
  state?: PresenceState;
  contextMode?: ContextMode;
  escalationLevel?: EscalationLevel;
  knowledge?: BubbleKnowledgeSnapshot | null;
  working?: boolean;
  sortHighlightRegion?: number | null;
  width?: number;
  height?: number;
  className?: string;
};

export function OrientBubble({
  state = 'rest',
  contextMode,
  escalationLevel,
  knowledge = null,
  working = false,
  sortHighlightRegion = null,
  width = 120,
  height = 120,
  className,
}: OrientBubbleProps) {
  return (
    <BubbleErrorBoundary state={state} width={width} height={height}>
      <div
        className={className}
        style={{
          width,
          height,
          minWidth: width,
          minHeight: height,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#000',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ fov: 60, position: [0, 0, 5], near: 0.1, far: 50 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000');
            gl.toneMapping = THREE.NoToneMapping;
          }}
        >
          <Suspense fallback={null}>
            <NeuralNetworkScene
              state={state}
              contextMode={contextMode}
              escalationLevel={escalationLevel}
              knowledge={knowledge}
              working={working}
              sortHighlightRegion={sortHighlightRegion}
            />
          </Suspense>
        </Canvas>
      </div>
    </BubbleErrorBoundary>
  );
}
