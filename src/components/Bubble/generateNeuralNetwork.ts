import {
  AMBER_RGB,
  BUBBLE_REGIONS,
  EDGE_DISTANCE,
  POINT_COUNT,
  SPHERE_RADIUS,
} from './bubbleRegions';

export type NeuralNetworkData = {
  pointPositions: Float32Array;
  pointRegions: Uint8Array;
  linePositions: Float32Array;
  lineThresholds: Float32Array;
  lineRegionA: Uint8Array;
  lineRegionB: Uint8Array;
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clampInSphere(
  x: number,
  y: number,
  z: number,
  radius: number,
  random: () => number,
): [number, number, number] {
  const len = Math.hypot(x, y, z);
  if (len <= radius) return [x, y, z];
  const s = (radius * (0.85 + random() * 0.15)) / len;
  return [x * s, y * s, z * s];
}

let rand = mulberry32(42);

export function generateNeuralNetwork(): NeuralNetworkData {
  rand = mulberry32(42);
  const perRegion = Math.floor(POINT_COUNT / BUBBLE_REGIONS.length);
  const remainder = POINT_COUNT - perRegion * BUBBLE_REGIONS.length;

  const nodes: { x: number; y: number; z: number; region: number }[] = [];

  BUBBLE_REGIONS.forEach((region, regionIndex) => {
    const count = perRegion + (regionIndex < remainder ? 1 : 0);
    const [cx, cy, cz] = region.position;
    for (let i = 0; i < count; i++) {
      const sigma = 0.38;
      const gx = cx + gaussian(rand) * sigma;
      const gy = cy + gaussian(rand) * sigma;
      const gz = cz + gaussian(rand) * sigma;
      const [x, y, z] = clampInSphere(gx, gy, gz, SPHERE_RADIUS, rand);
      nodes.push({ x, y, z, region: regionIndex });
    }
  });

  const pointPositions = new Float32Array(nodes.length * 3);
  const pointRegions = new Uint8Array(nodes.length);
  nodes.forEach((n, i) => {
    pointPositions[i * 3] = n.x;
    pointPositions[i * 3 + 1] = n.y;
    pointPositions[i * 3 + 2] = n.z;
    pointRegions[i] = n.region;
  });

  const linePositions: number[] = [];
  const lineThresholds: number[] = [];
  const lineRegionA: number[] = [];
  const lineRegionB: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i]!.x - nodes[j]!.x;
      const dy = nodes[i]!.y - nodes[j]!.y;
      const dz = nodes[i]!.z - nodes[j]!.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < EDGE_DISTANCE) {
        linePositions.push(nodes[i]!.x, nodes[i]!.y, nodes[i]!.z, nodes[j]!.x, nodes[j]!.y, nodes[j]!.z);
        lineThresholds.push(rand() * 0.8);
        lineRegionA.push(nodes[i]!.region);
        lineRegionB.push(nodes[j]!.region);
      }
    }
  }

  return {
    pointPositions,
    pointRegions,
    linePositions: new Float32Array(linePositions),
    lineThresholds: new Float32Array(lineThresholds),
    lineRegionA: new Uint8Array(lineRegionA),
    lineRegionB: new Uint8Array(lineRegionB),
  };
}

export function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function edgeBaseColor(regionA: number, regionB: number, mix = 0.35): [number, number, number] {
  const ra = BUBBLE_REGIONS[regionA]?.rgb ?? AMBER_RGB;
  const rb = BUBBLE_REGIONS[regionB]?.rgb ?? AMBER_RGB;
  const regionColor: [number, number, number] = [
    (ra[0] + rb[0]) * 0.5,
    (ra[1] + rb[1]) * 0.5,
    (ra[2] + rb[2]) * 0.5,
  ];
  return lerpRgb(AMBER_RGB, regionColor, mix);
}
