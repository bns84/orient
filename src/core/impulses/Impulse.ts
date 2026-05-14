/**
 * ORIENT - Impulse Domain Object
 * 
 * Rohes Denken erfassen - nicht bewerten, nicht zu früh strukturieren.
 * 
 * Respektiert ORIENT_DNA:
 * - Impulse sind Momentaufnahmen
 * - Sie verändern sich nicht, sie werden verknüpft
 * - Kein updatedAt (Momentaufnahme)
 * - Kontext behalten
 * 
 * Design-Note:
 * Impulse sind Momentaufnahmen. Sie werden nicht „editiert", sondern verknüpft oder gepinnt.
 * Dadurch bleibt Gedächtnis stabil und nachvollziehbar.
 */

import { ImpulseState } from './ImpulseState';

export type ImportanceHint = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ImpulseContent {
  text?: string;        // manuell eingegeben
  transcript?: string;  // voice-to-text (Phase 1)
  payloadRef?: string;  // später: Bild/Audio/Video Referenz (lokal)
}

export interface ImpulseLinks {
  threadIds: string[];
  entityIds: string[];
}

export interface ImpulseMeta {
  pinned: boolean;
  importanceHint?: ImportanceHint; // nur Nutzerhinweis, keine Auto-Bewertung
}

export interface Impulse {
  id: string;

  content: ImpulseContent;
  state: ImpulseState;

  createdAt: Date;

  links: ImpulseLinks;
  meta: ImpulseMeta;
}
