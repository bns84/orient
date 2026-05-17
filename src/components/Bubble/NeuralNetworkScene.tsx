/**
 * 3D-Inhalt: Glassphäre + neuronales Netz (R3F), daten- & präsenzgesteuert.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ContextMode } from '../../core/escalation/ContextMode';
import type { PresenceState } from '../../store/types';
import type { BubbleKnowledgeSnapshot } from './bubbleKnowledge';
import { contextBubbleModifier } from './contextBubbleModifiers';
import { AMBER_RGB, BUBBLE_REGIONS, POINT_SIZE, SPHERE_RADIUS } from './bubbleRegions';
import {
  edgeBaseColor,
  generateNeuralNetwork,
  lerpRgb,
  smoothstep,
} from './generateNeuralNetwork';
import { PRESENCE_STATE_CONFIG } from './presenceStateConfig';

const FRAME_BUFFER_TYPE = THREE.UnsignedByteType;
const CORE_RADIUS = 0.42;
const SORT_FLIGHT_SEC = 1.85;
const SORT_STAGGER = 0.22;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const EMPTY_KNOWLEDGE: BubbleKnowledgeSnapshot = {
  totalImpulses: 0,
  unlinkedInCore: 0,
  regionFill: Array(8).fill(0),
  maturity: 0,
  activation: 0.06,
  coreFill: 0.15,
};

type Props = {
  state: PresenceState;
  contextMode?: ContextMode;
  knowledge?: BubbleKnowledgeSnapshot | null;
  working?: boolean;
  sortHighlightRegion?: number | null;
};

function GlassSphere() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[SPHERE_RADIUS, 48, 48]} />
      <meshPhysicalMaterial
        transmission={0.92}
        thickness={0.5}
        roughness={0.08}
        ior={1.45}
        transparent
        opacity={0.1}
        depthWrite={false}
        color="#ffffff"
      />
    </mesh>
  );
}

function NeuralNetwork({
  state,
  contextMode = ContextMode.NORMAL,
  knowledge,
  working,
  sortHighlightRegion,
}: {
  state: PresenceState;
  contextMode: ContextMode;
  knowledge: BubbleKnowledgeSnapshot;
  working: boolean;
  sortHighlightRegion: number | null;
}) {
  const data = useMemo(() => generateNeuralNetwork(), []);
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef(state);
  const contextRef = useRef(contextMode);
  const knowledgeRef = useRef(knowledge);
  const workingRef = useRef(working);
  const sortRef = useRef(sortHighlightRegion);
  const sortStartRef = useRef(-1);
  const lastSortRegionRef = useRef<number | null>(null);
  stateRef.current = state;
  contextRef.current = contextMode;
  knowledgeRef.current = knowledge;
  workingRef.current = working;
  sortRef.current = sortHighlightRegion;

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
      groupRef.current.rotation.y += workingRef.current ? 0.0012 : 0.0005;
    }

    const k = knowledgeRef.current;
    const cfg = PRESENCE_STATE_CONFIG[stateRef.current];
    const ctxMod = contextBubbleModifier(contextRef.current);
    const presenceActivation = cfg.activation;
    const activation = Math.min(
      1,
      Math.max(
        presenceActivation * ctxMod.activationScale + ctxMod.activationBias,
        k.activation * ctxMod.activationScale + ctxMod.activationBias,
      ),
    );
    const activeSet = new Set([...cfg.activeRegions, ...ctxMod.extraActiveRegions]);
    const pulse = 1 + 0.8 * Math.sin(clock.elapsedTime * (workingRef.current ? 5.5 : 4.2));
    const sortRegion = sortRef.current;
    if (sortRegion !== lastSortRegionRef.current) {
      sortStartRef.current = sortRegion !== null ? clock.elapsedTime : -1;
      lastSortRegionRef.current = sortRegion;
    }
    const sortElapsed =
      sortRegion !== null && sortStartRef.current >= 0
        ? clock.elapsedTime - sortStartRef.current
        : 0;
    const sortFlightT =
      sortRegion !== null ? easeOutCubic(Math.min(1, sortElapsed / SORT_FLIGHT_SEC)) : 0;
    const sortPulse = sortRegion !== null ? 0.85 + 0.15 * Math.sin(clock.elapsedTime * 8) : 1;

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      const coreBoost = k.coreFill * (workingRef.current ? 1.4 : 1);
      mat.opacity = 0.15 + coreBoost * 0.65;
      const s = 0.1 + k.coreFill * 0.22 + (workingRef.current ? 0.08 * pulse : 0);
      coreRef.current.scale.setScalar(s);
    }

    const pointsMat = pointsRef.current?.material as THREE.PointsMaterial | undefined;
    if (pointsMat) {
      pointsMat.size =
        activeSet.size > 0 || workingRef.current ? POINT_SIZE * pulse * 1.1 : POINT_SIZE;
    }

    const lineAttr = linesRef.current?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (lineAttr) {
      const arr = lineAttr.array as Float32Array;
      for (let e = 0; e < data.lineThresholds.length; e++) {
        const threshold = data.lineThresholds[e]!;
        let opacity = smoothstep(threshold, threshold + 0.1, activation);
        const regionA = data.lineRegionA[e]!;
        const regionB = data.lineRegionB[e]!;
        const fillA = k.regionFill[regionA] ?? 0;
        const fillB = k.regionFill[regionB] ?? 0;
        const regionBoost = Math.max(fillA, fillB);
        opacity *= 0.25 + k.maturity * 0.45 + regionBoost * 0.45;
        const regionHit =
          activeSet.has(regionA) ||
          activeSet.has(regionB) ||
          regionA === sortRegion ||
          regionB === sortRegion;
        if (regionHit) {
          opacity = Math.min(1, opacity * 1.35 * pulse);
        }
        if (sortRegion !== null && (regionA === sortRegion || regionB === sortRegion)) {
          opacity = Math.min(1, opacity * 1.5 * sortPulse);
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
      const positions = data.pointPositions;
      for (let i = 0; i < data.pointRegions.length; i++) {
        const regionIdx = data.pointRegions[i]!;
        const region = BUBBLE_REGIONS[regionIdx]!;
        const px = positions[i * 3]!;
        const py = positions[i * 3 + 1]!;
        const pz = positions[i * 3 + 2]!;
        const dist = Math.hypot(px, py, pz) / SPHERE_RADIUS;
        const centerGate = 1 - smoothstep(CORE_RADIUS, CORE_RADIUS + 0.2, dist);
        const fill = k.regionFill[regionIdx] ?? 0;
        const immature = 1 - k.maturity;
        const mature = k.maturity;
        let visibility =
          immature * centerGate * (0.25 + k.coreFill * 0.75) +
          mature * (0.12 + fill * 0.88);
        if (k.totalImpulses === 0) {
          visibility = centerGate * 0.35;
        }
        if (workingRef.current) {
          visibility += centerGate * 0.35 * (pulse - 1);
        }
        let flightT = 1;
        if (regionIdx === sortRegion && sortFlightT < 1) {
          const stagger = ((i * 0.13) % 1) * SORT_STAGGER;
          flightT =
            sortFlightT <= stagger ? 0 : Math.min(1, (sortFlightT - stagger) / (1 - stagger));
          visibility = Math.min(1, visibility + flightT * 0.45);
        }
        if (regionIdx === sortRegion) {
          visibility = Math.min(1, visibility * 1.4 * sortPulse);
        }
        if (activeSet.has(regionIdx)) {
          visibility = Math.min(1, visibility * pulse);
        }
        visibility = Math.min(1, Math.max(0.04, visibility));
        const scale = 0.55 * visibility;
        const rgb =
          regionIdx === sortRegion && flightT < 0.92
            ? lerpRgb(AMBER_RGB, region.rgb, flightT)
            : region.rgb;
        arr[i * 3] = rgb[0] * scale;
        arr[i * 3 + 1] = rgb[1] * scale;
        arr[i * 3 + 2] = rgb[2] * scale;
      }
      pointAttr.needsUpdate = true;
    }

    const posAttr = pointsRef.current?.geometry.getAttribute('position') as
      | THREE.BufferAttribute
      | undefined;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      const home = data.pointPositions;
      if (sortRegion !== null && sortFlightT > 0 && sortFlightT < 1) {
        for (let i = 0; i < data.pointRegions.length; i++) {
          if (data.pointRegions[i] !== sortRegion) {
            arr[i * 3] = home[i * 3]!;
            arr[i * 3 + 1] = home[i * 3 + 1]!;
            arr[i * 3 + 2] = home[i * 3 + 2]!;
            continue;
          }
          const stagger = ((i * 0.13) % 1) * SORT_STAGGER;
          const localT =
            sortFlightT <= stagger ? 0 : Math.min(1, (sortFlightT - stagger) / (1 - stagger));
          const hx = home[i * 3]!;
          const hy = home[i * 3 + 1]!;
          const hz = home[i * 3 + 2]!;
          const startScale = 0.06 + (i % 5) * 0.018;
          const s = startScale + (1 - startScale) * localT;
          arr[i * 3] = hx * s;
          arr[i * 3 + 1] = hy * s;
          arr[i * 3 + 2] = hz * s;
        }
        posAttr.needsUpdate = true;
      } else if (sortRegion === null || sortFlightT >= 1) {
        arr.set(home);
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef} renderOrder={1}>
        <sphereGeometry args={[0.35, 20, 20]} />
        <meshBasicMaterial
          color="#c88c1a"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
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

export function NeuralNetworkScene({
  state,
  contextMode = ContextMode.NORMAL,
  knowledge,
  working = false,
  sortHighlightRegion = null,
}: Props) {
  const k = knowledge ?? EMPTY_KNOWLEDGE;

  return (
    <>
      <ambientLight intensity={0.35} />
      <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.05} />

      <GlassSphere />
      <NeuralNetwork
        state={state}
        contextMode={contextMode}
        knowledge={k}
        working={working}
        sortHighlightRegion={sortHighlightRegion}
      />

      <EffectComposer multisampling={0} frameBufferType={FRAME_BUFFER_TYPE}>
        <Bloom intensity={1.8} luminanceThreshold={0.1} luminanceSmoothing={0.6} mipmapBlur />
      </EffectComposer>
    </>
  );
}
