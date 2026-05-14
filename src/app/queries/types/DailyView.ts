/**
 * ORIENT - Daily View Type
 * 
 * Tagesübersicht: 1–3 relevante Themen (kein Feed).
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Keine Endlosfeeds
 * - Stille ist ein Feature
 */

import { ThreadSnapshot } from './ThreadSnapshot';

export interface DailyView {
  date: string; // YYYY-MM-DD
  items: ThreadSnapshot[]; // typischerweise 1–3
  note?: string; // optionaler kurzer Satz (z.B. "Ruhemodus aktiv")
}
