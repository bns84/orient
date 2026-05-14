/**
 * ORIENT - Graph Core Tests
 * 
 * Tests für Graph-Linker, Edges, Entities.
 * Respektiert ORIENT_DNA: Transparenz, Stabilität.
 */

import { describe, it, expect } from 'vitest';
import { GraphLinker } from '@core/graph/GraphLinker';
import { RelationType } from '@core/graph/RelationType';
import { NodeRef } from '@core/graph/NodeRef';

describe('Graph Core', () => {
  const thread: NodeRef = { type: 'THREAD', id: 't1' };
  const impulse: NodeRef = { type: 'IMPULSE', id: 'i1' };
  const entity: NodeRef = { type: 'ENTITY', id: 'en1' };

  it('creates deterministic edge ids', () => {
    const e1 = GraphLinker.link({
      from: impulse,
      to: thread,
      relation: RelationType.RELATED_TO,
      weights: { confidence: 0.5, recency: 0.5, frequency: 0.1, userRelevance: 0.8 },
      at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const e2 = GraphLinker.link({
      from: impulse,
      to: thread,
      relation: RelationType.RELATED_TO,
      weights: { confidence: 0.6, recency: 0.4, frequency: 0.2, userRelevance: 0.9 },
      at: new Date('2026-01-02T00:00:00.000Z'),
    });

    expect(e1.id).toBe(e2.id); // Deterministisch: gleiche Parameter = gleiche ID
  });

  it('updates existing edge lastSeenAt and weights', () => {
    const created = GraphLinker.link({
      from: impulse,
      to: entity,
      relation: RelationType.OCCURS_WITH,
      weights: { confidence: 0.2, recency: 0.2, frequency: 0.2, userRelevance: 0.2 },
      at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const updated = GraphLinker.link({
      existing: created,
      from: impulse,
      to: entity,
      relation: RelationType.OCCURS_WITH,
      weights: { confidence: 0.9, recency: 0.9, frequency: 0.9, userRelevance: 0.9 },
      at: new Date('2026-01-03T00:00:00.000Z'),
    });

    expect(updated.id).toBe(created.id); // Gleiche ID
    expect(updated.lastSeenAt.toISOString()).toBe('2026-01-03T00:00:00.000Z');
    expect(updated.weights.confidence).toBe(0.9); // Weights aktualisiert
    expect(updated.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z'); // createdAt bleibt
  });

  it('clamps weights into 0..1', () => {
    const e = GraphLinker.link({
      from: thread,
      to: entity,
      relation: RelationType.INFLUENCES,
      weights: { confidence: 10, recency: -1, frequency: 2, userRelevance: 0.5 },
    });

    expect(e.weights.confidence).toBe(1);
    expect(e.weights.recency).toBe(0);
    expect(e.weights.frequency).toBe(1);
    expect(e.weights.userRelevance).toBe(0.5);
  });

  it('handles optional sourceWeight', () => {
    const e = GraphLinker.link({
      from: impulse,
      to: entity,
      relation: RelationType.RELATED_TO,
      weights: {
        confidence: 0.5,
        recency: 0.5,
        frequency: 0.5,
        userRelevance: 0.5,
        sourceWeight: 0.8,
      },
    });

    expect(e.weights.sourceWeight).toBe(0.8);
  });

  it('clamps sourceWeight to 0..1', () => {
    const e = GraphLinker.link({
      from: impulse,
      to: thread,
      relation: RelationType.SUPPORTS,
      weights: {
        confidence: 0.5,
        recency: 0.5,
        frequency: 0.5,
        userRelevance: 0.5,
        sourceWeight: 1.5,
      },
    });

    expect(e.weights.sourceWeight).toBe(1);
  });

  describe('DNA-Konformität', () => {
    it('deterministic IDs enable idempotency (DNA: Stabilität)', () => {
      const e1 = GraphLinker.link({
        from: thread,
        to: entity,
        relation: RelationType.INFLUENCES,
        weights: { confidence: 0.3, recency: 0.3, frequency: 0.3, userRelevance: 0.3 },
      });

      const e2 = GraphLinker.link({
        from: thread,
        to: entity,
        relation: RelationType.INFLUENCES,
        weights: { confidence: 0.7, recency: 0.7, frequency: 0.7, userRelevance: 0.7 },
      });

      expect(e1.id).toBe(e2.id); // Gleiche ID = idempotent
    });

    it('transparent weights (DNA: Transparenz statt Blackbox)', () => {
      const e = GraphLinker.link({
        from: impulse,
        to: thread,
        relation: RelationType.RELATED_TO,
        weights: { confidence: 0.5, recency: 0.5, frequency: 0.5, userRelevance: 0.5 },
      });

      // Alle Gewichte sind sichtbar und nachvollziehbar
      expect(e.weights.confidence).toBeDefined();
      expect(e.weights.recency).toBeDefined();
      expect(e.weights.frequency).toBeDefined();
      expect(e.weights.userRelevance).toBeDefined();
    });
  });
});
