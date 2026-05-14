/**
 * ORIENT - Visual Cluster
 * 
 * Cluster = Themen-Areale / Denkfelder.
 * 
 * Respektiert ORIENT_DNA:
 * - Cluster entstehen aus echten Themen-Verdichtungen
 * - Keine dekorativen Cluster
 */

export interface VisualCluster {
  id: string;
  label: string;

  center: {
    x: number;
    y: number;
    z: number;
  };

  radius: number;      // 0..1
  density: number;     // 0..1 (viele Knoten nah beieinander)

  color: string;
  dominant: boolean;
}
