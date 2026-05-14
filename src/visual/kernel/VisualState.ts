/**
 * ORIENT - Visual State
 * 
 * Gesamter Zustand für einen Frame / einen Moment.
 * 
 * Respektiert ORIENT_DNA:
 * - Jeder Zustand ist ableitbar aus System-Daten
 * - Keine "fake" Aktivität
 */

import { VisualNode } from './VisualNode';
import { VisualEdge } from './VisualEdge';
import { VisualCluster } from './VisualCluster';

export interface VisualState {
  nodes: VisualNode[];
  edges: VisualEdge[];
  clusters: VisualCluster[];

  focus?: {
    type: 'THREAD' | 'CLUSTER' | 'NODE';
    id: string;
  };

  ambience: {
    motion: number;    // 0..1 (Ruhe vs. Aktivität)
    glow: number;      // 0..1
    noise: number;     // 0..1 (Staub / Unschärfe)
  };
}
