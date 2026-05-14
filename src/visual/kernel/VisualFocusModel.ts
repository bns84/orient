/**
 * ORIENT - Visual Focus Model
 * 
 * Einheitliches Modell, damit UI später nur „folgt".
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Klare Datenstruktur, keine Magie
 */

export type FocusTargetType = 'THREAD' | 'CLUSTER' | 'NODE';

export interface VisualFocus {
  type: FocusTargetType;
  id: string;

  // Zoom 0..1: 0 = Übersicht, 1 = nah dran
  zoom: number;
}
