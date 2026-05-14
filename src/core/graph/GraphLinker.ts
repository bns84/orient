/**
 * ORIENT - Graph Linker
 * 
 * Der Kern: Edges erzeugen oder updaten, deterministisch, idempotent.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Stabilität durch deterministische IDs
 * - Ruhe vor Geschwindigkeit
 */

import { NodeRef } from './NodeRef';
import { RelationType } from './RelationType';
import { Edge, edgeKey, withUpdatedSeen } from './Edge';
import { EdgeWeights, normalizeWeights } from './EdgeWeights';

/**
 * Einfacher deterministischer Hash für Edge-IDs
 * Nicht kryptographisch, ausreichend für lokale IDs
 */
const hashId = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return `e_${Math.abs(h)}`;
};

export class GraphLinker {
  /**
   * Erstellt oder aktualisiert eine Edge
   * Deterministisch: gleiche Parameter = gleiche ID
   * Idempotent: wiederholte Aufrufe = Update, keine Duplikate
   */
  static link(params: {
    existing?: Edge | null;
    from: NodeRef;
    to: NodeRef;
    relation: RelationType;
    weights: EdgeWeights;
    at?: Date;
  }): Edge {
    const at = params.at ?? new Date();
    const key = edgeKey(params.from, params.to, params.relation);
    const id = hashId(key);
    const weights = normalizeWeights(params.weights);

    if (params.existing) {
      // Update lastSeen und optional weights (überschreiben als neueste Sicht)
      return withUpdatedSeen(params.existing, at, weights);
    }

    return {
      id,
      from: params.from,
      to: params.to,
      relation: params.relation,
      weights,
      createdAt: at,
      lastSeenAt: at,
    };
  }
}
