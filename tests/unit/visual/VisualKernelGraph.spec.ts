/**
 * ORIENT - Visual Kernel Graph Tests
 * 
 * Tests für VisualKernelGraph.
 * Respektiert ORIENT_DNA: Wenn etwas verbunden aussieht, IST es verbunden.
 */

import { describe, it, expect } from 'vitest';
import { VisualKernelGraph } from '@visual/kernel/VisualKernelGraph';
import { VisualState } from '@visual/kernel/VisualState';
import { Edge } from '@core/graph/Edge';
import { RelationType } from '@core/graph/RelationType';
import { NodeRef } from '@core/graph/NodeRef';

describe('VisualKernelGraph', () => {
  it('attaches only edges whose endpoints are visible', () => {
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

    const edges: Edge[] = [
      {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.9,
          recency: 0.9,
          frequency: 0.2,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
      {
        id: 'e2',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't999' } as NodeRef, // not visible
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.9,
          recency: 0.9,
          frequency: 0.2,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
    ];

    const out = VisualKernelGraph.attachEdges(base, edges);

    expect(out.edges.length).toBe(1);
    expect(out.edges[0].id).toBe('e1');
    expect(out.edges[0].thickness).toBeGreaterThan(0.5);
    expect(out.edges[0].from).toBe('t1');
    expect(out.edges[0].to).toBe('t2');
  });

  it('filters out edges with missing from node', () => {
    const base: VisualState = {
      nodes: [
        {
          id: 't2',
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

    const edges: Edge[] = [
      {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef, // not visible
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.5,
          recency: 0.5,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
    ];

    const out = VisualKernelGraph.attachEdges(base, edges);

    expect(out.edges.length).toBe(0);
  });

  it('filters out edges with missing to node', () => {
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

    const edges: Edge[] = [
      {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef, // not visible
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.5,
          recency: 0.5,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
    ];

    const out = VisualKernelGraph.attachEdges(base, edges);

    expect(out.edges.length).toBe(0);
  });

  it('preserves existing edges and adds new ones', () => {
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
          position: { x: 1, y: 1, z: 0 },
          size: 0.5,
          intensity: 0.5,
          stability: 0.5,
          color: '#000',
          opacity: 1,
          semanticWeight: 0.5,
        },
      ],
      edges: [
        {
          id: 'existing',
          from: 't1',
          to: 't2',
          thickness: 0.5,
          opacity: 0.5,
          flow: 0.5,
          confidence: 0.5,
        },
      ],
      clusters: [],
      ambience: { motion: 0.4, glow: 0.4, noise: 0.1 },
    };

    const edges: Edge[] = [
      {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.8,
          recency: 0.8,
          frequency: 0.3,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      },
    ];

    const out = VisualKernelGraph.attachEdges(base, edges);

    // Existing edges werden überschrieben (nicht dupliziert)
    expect(out.edges.length).toBe(1);
    expect(out.edges[0].id).toBe('e1');
  });

  describe('DNA-Konformität', () => {
    it('only shows edges for visible nodes (DNA: Wenn etwas verbunden aussieht, IST es verbunden)', () => {
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

      const edges: Edge[] = [
        {
          id: 'e1',
          from: { type: 'THREAD', id: 't1' } as NodeRef,
          to: { type: 'THREAD', id: 't999' } as NodeRef, // not visible
          relation: RelationType.RELATED_TO,
          weights: {
            confidence: 0.9,
            recency: 0.9,
            frequency: 0.9,
            userRelevance: 0.9,
          },
          createdAt: new Date(),
          lastSeenAt: new Date(),
        },
      ];

      const out = VisualKernelGraph.attachEdges(base, edges);

      // Keine Fake-Verbindungen
      expect(out.edges.length).toBe(0);
    });

    it('maps confidence to thickness (DNA: Dichte Adern = hohe Confidence)', () => {
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

      const highConfidence: Edge = {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.9,
          recency: 0.5,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      };

      const lowConfidence: Edge = {
        id: 'e2',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.1,
          recency: 0.5,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      };

      const outHigh = VisualKernelGraph.attachEdges(base, [highConfidence]);
      const outLow = VisualKernelGraph.attachEdges(base, [lowConfidence]);

      // Hohe Confidence = dickere Kante
      expect(outHigh.edges[0].thickness).toBeGreaterThan(outLow.edges[0].thickness);
    });

    it('maps recency to flow (DNA: Puls = Recency/Frequency)', () => {
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

      const highRecency: Edge = {
        id: 'e1',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.5,
          recency: 0.9,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      };

      const lowRecency: Edge = {
        id: 'e2',
        from: { type: 'THREAD', id: 't1' } as NodeRef,
        to: { type: 'THREAD', id: 't2' } as NodeRef,
        relation: RelationType.RELATED_TO,
        weights: {
          confidence: 0.5,
          recency: 0.1,
          frequency: 0.5,
          userRelevance: 0.5,
        },
        createdAt: new Date(),
        lastSeenAt: new Date(),
      };

      const outHigh = VisualKernelGraph.attachEdges(base, [highRecency]);
      const outLow = VisualKernelGraph.attachEdges(base, [lowRecency]);

      // Hohe Recency = mehr Flow (Puls)
      expect(outHigh.edges[0].flow).toBeGreaterThan(outLow.edges[0].flow);
    });
  });
});
