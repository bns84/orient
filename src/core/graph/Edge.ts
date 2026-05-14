/**
 * ORIENT - Edge Domain Object
 * 
 * Edges sind immutable, idempotent identifizierbar.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Stabilität durch deterministische IDs
 */

import { NodeRef, nodeKey } from './NodeRef';
import { RelationType } from './RelationType';
import { EdgeWeights, normalizeWeights } from './EdgeWeights';

export interface Edge {
  id: string;          // deterministic hashable id, generated in GraphLinker
  from: NodeRef;
  to: NodeRef;
  relation: RelationType;
  weights: EdgeWeights;

  createdAt: Date;
  lastSeenAt: Date;
}

/**
 * Erzeugt einen eindeutigen Key für eine Edge
 */
export const edgeKey = (from: NodeRef, to: NodeRef, rel: RelationType): string =>
  `${nodeKey(from)}->${nodeKey(to)}#${rel}`;

/**
 * Aktualisiert lastSeenAt und optional weights
 */
export const withUpdatedSeen = (edge: Edge, at: Date, weights?: EdgeWeights): Edge => ({
  ...edge,
  lastSeenAt: at,
  weights: weights ? normalizeWeights(weights) : edge.weights,
});
