/**
 * 3D-Inhalt: Glassphäre + neuronales Netz (R3F)
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, SelectiveBloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { PresenceState } from '../../store/types';
import { BUBBLE_REGIONS, POINT_SIZE, SPHERE_RADIUS } from './bubbleRegions';
import {
  edgeBaseColor,
  generateNeuralNetwork,
  smoothstep,
} from './generateNeuralNetwork';
import { PRESENCE_STATE_CONFIG } from './presenceStateConfig';

type Props = {
  state: PresenceState;
};

function GlassSphere() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.5}
        roughness={0.05}
        ior={1.5}
        transparent
        opacity={0.08}
        depthWrite={false}
        color="#ffffff"
      />
    </mesh>
  );
}

function NeuralNetwork({ state }: { state: PresenceState }) {
  const data = useMemo(() => generateNeuralNetwork(), []);
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const pointColors = useMemo(() => {
    const colors = new Float32Array(data.pointPositions.length);
    for (let i = 0; i < data.pointRegions.length; i++) {
      const region = BUBBLE_REGIONS[data.pointRegions[i]!]!;
      const base = 0.55;
      colors[i * 3] = region.rgb[0] * base;
      colors[i * 3 + 1] = region.rgb[1] * base;
      colors[i * 3 + 2] = region.rgb[2] * base;
    }
    return colors;
  }, [data]);

  const lineColors = useMemo(() => {
    const edgeCount = data.lineThresholds.length;
    const colors = new Float32Array(edgeCount * 2 * 3);
    for (let e = 0; e < edgeCount; e++) {
      const rgb = edgeBaseColor(data.lineRegionA[e]!, data.lineRegionB[e]!);
      for (let v = 0; v < 2; v++) {
        const o = (e * 2 + v) * 3;
        colors[o] = rgb[0];
        colors[o + 1] = rgb[1];
        colors[o + 2] = rgb[2];
      }
    }
    return colors;
  }, [data]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.linePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    return geo;
  }, [data, lineColors]);

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.pointPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));
    return geo;
  }, [data, pointColors]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }

    const cfg = PRESENCE_STATE_CONFIG[state];
    const activation = cfg.activation;
    const activeSet = new Set(cfg.activeRegions);
    const pulse = 1 + 0.8 * Math.sin(clock.elapsedTime * 4.2);

    const pointsMat = pointsRef.current?.material as THREE.PointsMaterial | undefined;
    if (pointsMat) {
      pointsMat.size = activeSet.size > 0 ? POINT_SIZE * pulse : POINT_SIZE;
    }

    const lineAttr = linesRef.current?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (lineAttr) {
      const arr = lineAttr.array as Float32Array;
      for (let e = 0; e < data.lineThresholds.length; e++) {
        const threshold = data.lineThresholds[e]!;
        let opacity = smoothstep(threshold, threshold + 0.1, activation);
        const regionA = data.lineRegionA[e]!;
        const regionB = data.lineRegionB[e]!;
        const regionHit = activeSet.has(regionA) || activeSet.has(regionB);
        if (regionHit) {
          opacity = Math.min(1, opacity * 1.35 * pulse);
        }
        const rgb = edgeBaseColor(regionA, regionB, regionHit ? 0.72 : 0.28);
        for (let v = 0; v < 2; v++) {
          const o = (e * 2 + v) * 3;
          arr[o] = rgb[0] * opacity;
          arr[o + 1] = rgb[1] * opacity;
          arr[o + 2] = rgb[2] * opacity;
        }
      }
      lineAttr.needsUpdate = true;
    }

    const pointAttr = pointsRef.current?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (pointAttr) {
      const arr = pointAttr.array as Float32Array;
      for (let i = 0; i < data.pointRegions.length; i++) {
        const region = BUBBLE_REGIONS[data.pointRegions[i]!]!;
        let scale = 0.55;
        if (activeSet.has(data.pointRegions[i]!)) {
          scale = 0.55 * pulse;
        }
        arr[i * 3] = region.rgb[0] * scale;
        arr[i * 3 + 1] = region.rgb[1] * scale;
        arr[i * 3 + 2] = region.rgb[2] * scale;
      }
      pointAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={pointsGeo} renderOrder={2}>
        <pointsMaterial
          size={POINT_SIZE}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeo} renderOrder={2}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

export function NeuralNetworkScene({ state }: Props) {
  const networkRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.AmbientLight>(null);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight ref={lightRef} intensity={0.25} />
      <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.05} />

      <GlassSphere />

      <group ref={networkRef}>
        <NeuralNetwork state={state} />
      </group>

      <EffectComposer multisampling={0}>
        <SelectiveBloom
          selection={networkRef as React.RefObject<THREE.Object3D>}
          lights={[lightRef as React.RefObject<THREE.Object3D>]}
          intensity={1.8}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.6}
        />
      </EffectComposer>
    </>
  );
}
