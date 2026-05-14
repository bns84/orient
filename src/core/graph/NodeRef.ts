/**
 * ORIENT - Node Reference
 * 
 * Generische Referenz für Knoten im Graph.
 * Thread, Impulse, Entity, Claim, Source.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Klare Struktur
 */

export type NodeType = 'THREAD' | 'IMPULSE' | 'ENTITY' | 'CLAIM' | 'SOURCE';

export interface NodeRef {
  type: NodeType;
  id: string;
}

/**
 * Erzeugt einen eindeutigen Key für einen NodeRef
 */
export const nodeKey = (n: NodeRef): string => `${n.type}:${n.id}`;
