/**
 * ORIENT - Visual State Pipeline
 * 
 * Vollständige Pipeline: DailyView → VisualState
 * 
 * Orchestriert alle Visual-Komponenten:
 * 1. Nodes aus ThreadSnapshots
 * 2. Edges aus Graph
 * 3. Clusters aus Themen
 * 4. Focus/Zoom
 * 
 * Respektiert ORIENT_DNA:
 * - Deterministisch (gleiche Inputs = gleiche Outputs)
 * - Testbar (keine UI-Abhängigkeiten)
 * - Transparenz (jeder Schritt nachvollziehbar)
 * - Keine Fake-Ästhetik
 */

import { DailyView } from '@app/queries/types/DailyView';
import { ThreadSnapshot } from '@app/queries/types/ThreadSnapshot';
import { Edge } from '@core/graph/Edge';

import { VisualState } from '../kernel/VisualState';
import { VisualKernel } from '../kernel/VisualKernel';
import { VisualKernelGraph } from '../kernel/VisualKernelGraph';
import { VisualKernelClusters } from '../kernel/VisualKernelClusters';
import { ClusterHint } from '../kernel/VisualClusterBuilder';
import { VisualFocus } from '../kernel/VisualFocusModel';

export interface VisualPipelineInput {
  dailyView: DailyView;
  edges?: Edge[];

  context: 'QUIET' | 'NORMAL' | 'FOCUS';

  // optional: Zuweisung Thread -> Cluster (z.B. aus Topics)
  clusterHint?: ClusterHint;

  // optional: Fokus setzen (z.B. bei User-Query)
  focus?: VisualFocus;
}

export class VisualStatePipeline {
  /**
   * Baut VisualState aus DailyView + Graph + Clusters + Focus
   * DNA: Deterministisch, testbar, UI-frei
   */
  static build(input: VisualPipelineInput): VisualState {
    const snaps = input.dailyView.items as ThreadSnapshot[];

    // 1) Nodes aus Snapshots
    let state = VisualKernel.fromThreadSnapshots(snaps, input.context);

    // 2) Edges (Graph-Kanten) anhängen
    if (input.edges?.length) {
      state = VisualKernelGraph.attachEdges(state, input.edges);
    }

    // 3) Cluster (Themen-Areale) anhängen
    state = VisualKernelClusters.attachClusters(state, input.clusterHint);

    // 4) Focus/Zoom anwenden
    if (input.focus) {
      state = VisualKernelClusters.setFocus(state, input.focus);
    }

    return state;
  }
}
