import type { Vector3Tuple } from 'three';

export type BubbleRegion = {
  id: string;
  position: Vector3Tuple;
  hex: string;
  rgb: [number, number, number];
};

export const BUBBLE_REGIONS: BubbleRegion[] = [
  { id: 'emotion', position: [-1.0, -0.4, -0.6], hex: '#FF3A0A', rgb: [1, 0.23, 0.04] },
  { id: 'social', position: [-0.5, -0.9, 0.7], hex: '#FF8000', rgb: [1, 0.5, 0] },
  { id: 'language', position: [0.3, -1.0, 0.9], hex: '#2A90FF', rgb: [0.16, 0.56, 1] },
  { id: 'logic', position: [1.2, -0.2, 0.4], hex: '#00DCCA', rgb: [0, 0.86, 0.79] },
  { id: 'memory', position: [0.1, 1.1, -0.9], hex: '#9430FF', rgb: [0.58, 0.19, 1] },
  { id: 'strategy', position: [0.9, 0.7, 0.4], hex: '#0EC83A', rgb: [0.05, 0.78, 0.23] },
  { id: 'creative', position: [-0.6, -1.1, 0.6], hex: '#E02CC6', rgb: [0.88, 0.17, 0.78] },
  { id: 'instinct', position: [-0.8, 0.8, 0.3], hex: '#FF5800', rgb: [1, 0.35, 0] },
];

export const AMBER_RGB: [number, number, number] = [200 / 255, 140 / 255, 25 / 255];

export const SPHERE_RADIUS = 2;
export const EDGE_DISTANCE = 0.6;
export const POINT_COUNT = 380;
export const POINT_SIZE = 0.012;
