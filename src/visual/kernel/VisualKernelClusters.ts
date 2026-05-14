/**
 * ORIENT - Visual Kernel Clusters
 * 
 * Attach Clusters + set Focus.
 * Phase 1: Fokus ist nur ein Datenwert.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (Fokus ist Daten, keine Magie)
 * - Ruhe vor Geschwindigkeit (einfache Ambience-Anpassung)
 * - Keine Fake-Effekte
 */

import { VisualState } from './VisualState';
import { VisualClusterBuilder, ClusterHint } from './VisualClusterBuilder';
import { VisualFocus } from './VisualFocusModel';

export class VisualKernelClusters {
  /**
   * Fügt Cluster zu VisualState hinzu
   * DNA: Cluster entstehen aus echten Themen-Verdichtungen
   */
  static attachClusters(state: VisualState, hint?: ClusterHint): VisualState {
    const clusters = VisualClusterBuilder.build(state.nodes, hint);
    return { ...state, clusters };
  }

  /**
   * Setzt Fokus auf einen Thread/Cluster/Node
   * DNA: Fokus beeinflusst Ambience, nicht Inhalte
   */
  static setFocus(state: VisualState, focus: VisualFocus): VisualState {
    return {
      ...state,
      focus: { type: focus.type as any, id: focus.id },
      // ambience kann UI später je nach zoom interpretieren
      ambience: {
        ...state.ambience,
        motion: Math.max(0.1, state.ambience.motion * (1 - focus.zoom * 0.3)),
        glow: Math.min(1, state.ambience.glow + focus.zoom * 0.2),
      },
    };
  }
}
