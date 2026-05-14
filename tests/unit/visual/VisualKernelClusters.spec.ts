/**
 * ORIENT - Visual Kernel Clusters Tests
 * 
 * Tests für VisualKernelClusters.
 * Respektiert ORIENT_DNA: Cluster entstehen aus echten Themen-Verdichtungen.
 */

import { describe, it, expect } from 'vitest';
import { VisualKernelClusters } from '@visual/kernel/VisualKernelClusters';
import { VisualState } from '@visual/kernel/VisualState';
import { VisualNode } from '@visual/kernel/VisualNode';

describe('VisualKernelClusters', () => {
  it('builds clusters from hint mapping', () => {
    const base: VisualState = {
      nodes: [
        {
          id: 't1',
          type: 'THREAD',
          position: { x: 0, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't2',
          type: 'THREAD',
          position: { x: 1, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't3',
          type: 'THREAD',
          position: { x: 0, y: 1, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
      ],
      edges: [],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const out = VisualKernelClusters.attachClusters(base, {
      byThreadId: { t1: 'Finanzen', t2: 'Finanzen', t3: 'Feiern' },
    });

    expect(out.clusters.length).toBe(2);
    const labels = out.clusters.map((c) => c.label).sort();
    expect(labels).toEqual(['Feiern', 'Finanzen']);

    // Finanzen-Cluster sollte 2 Nodes haben
    const finanzen = out.clusters.find((c) => c.label === 'Finanzen');
    expect(finanzen).toBeDefined();
    expect(finanzen!.density).toBeGreaterThan(0);
  });

  it('creates default cluster when no hint provided', () => {
    const base: VisualState = {
      nodes: [
        {
          id: 't1',
          type: 'THREAD',
          position: { x: 0, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't2',
          type: 'THREAD',
          position: { x: 1, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
      ],
      edges: [],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const out = VisualKernelClusters.attachClusters(base);

    expect(out.clusters.length).toBe(1);
    expect(out.clusters[0].label).toBe('Themen');
    expect(out.clusters[0].id).toBe('cl_DEFAULT');
  });

  it('ignores non-THREAD nodes', () => {
    const base: VisualState = {
      nodes: [
        {
          id: 't1',
          type: 'THREAD',
          position: { x: 0, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 'i1',
          type: 'IMPULSE',
          position: { x: 1, y: 0, z: 0 },
          size: 0.3,
          intensity: 0.3,
          stability: 0.3,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.3,
        },
      ],
      edges: [],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const out = VisualKernelClusters.attachClusters(base);

    // Nur THREAD-Nodes werden in Clustern berücksichtigt
    expect(out.clusters.length).toBe(1);
    expect(out.clusters[0].label).toBe('Themen');
  });

  it('applies focus zoom as ambience adjustment', () => {
    const base: VisualState = {
      nodes: [],
      edges: [],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const out = VisualKernelClusters.setFocus(base, {
      type: 'CLUSTER',
      id: 'cl_Finanzen',
      zoom: 1,
    });

    expect(out.focus).toBeDefined();
    expect(out.focus?.type).toBe('CLUSTER');
    expect(out.focus?.id).toBe('cl_Finanzen');
    expect(out.ambience.glow).toBeGreaterThan(0.4);
    expect(out.ambience.motion).toBeLessThanOrEqual(0.4);
  });

  it('reduces motion and increases glow with higher zoom', () => {
    const base: VisualState = {
      nodes: [],
      edges: [],
      clusters: [],
      ambience: { motion: 0.5, glow: 0.3, noise: 0.1 },
    };

    const outLow = VisualKernelClusters.setFocus(base, {
      type: 'THREAD',
      id: 't1',
      zoom: 0.3,
    });

    const outHigh = VisualKernelClusters.setFocus(base, {
      type: 'THREAD',
      id: 't1',
      zoom: 0.9,
    });

    // Höherer Zoom = weniger Motion, mehr Glow
    expect(outHigh.ambience.motion).toBeLessThan(outLow.ambience.motion);
    expect(outHigh.ambience.glow).toBeGreaterThan(outLow.ambience.glow);
  });

  it('marks largest cluster as dominant', () => {
    const base: VisualState = {
      nodes: [
        {
          id: 't1',
          type: 'THREAD',
          position: { x: 0, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't2',
          type: 'THREAD',
          position: { x: 1, y: 0, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't3',
          type: 'THREAD',
          position: { x: 0, y: 1, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
        {
          id: 't4',
          type: 'THREAD',
          position: { x: 1, y: 1, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
      ],
      edges: [],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const out = VisualKernelClusters.attachClusters(base, {
      byThreadId: { t1: 'A', t2: 'A', t3: 'B', t4: 'B' },
    });

    // Beide Cluster haben 2 Nodes, aber einer sollte dominant sein
    const dominant = out.clusters.find((c) => c.dominant);
    expect(dominant).toBeDefined();
    expect(dominant!.dominant).toBe(true);

    // Nur ein Cluster sollte dominant sein
    const dominantCount = out.clusters.filter((c) => c.dominant).length;
    expect(dominantCount).toBe(1);
  });

  describe('DNA-Konformität', () => {
    it('creates clusters deterministically (DNA: keine Zufälligkeit)', () => {
      const base: VisualState = {
        nodes: [
          {
            id: 't1',
            type: 'THREAD',
            position: { x: 0, y: 0, z: 0 },
            size: 0.5,
            intensity: 0.5,
            stability: 0.5,
            color: '#000',
            opacity: 1,
            semanticWeight: 0.5,
          },
        ],
        edges: [],
        clusters: [],
        ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
      };

      const out1 = VisualKernelClusters.attachClusters(base, {
        byThreadId: { t1: 'Test' },
      });

      const out2 = VisualKernelClusters.attachClusters(base, {
        byThreadId: { t1: 'Test' },
      });

      // Gleiche Inputs = gleiche Cluster
      expect(out1.clusters[0].id).toBe(out2.clusters[0].id);
      expect(out1.clusters[0].color).toBe(out2.clusters[0].color);
    });

    it('focus is data, not magic (DNA: Transparenz)', () => {
      const base: VisualState = {
        nodes: [],
        edges: [],
        clusters: [],
        ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
      };

      const out = VisualKernelClusters.setFocus(base, {
        type: 'THREAD',
        id: 't1',
        zoom: 0.5,
      });

      // Fokus ist explizit im State
      expect(out.focus).toBeDefined();
      expect(out.focus?.type).toBe('THREAD');
      expect(out.focus?.id).toBe('t1');

      // Ambience-Anpassung ist nachvollziehbar
      expect(out.ambience.motion).toBeLessThan(0.4); // Reduziert
      expect(out.ambience.glow).toBeGreaterThan(0.4); // Erhöht
    });
  });
});
