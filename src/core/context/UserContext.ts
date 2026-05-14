/**
 * ORIENT - User Context
 * 
 * Repräsentiert den aktuellen User-Kontext.
 * 
 * Respektiert ORIENT_DNA:
 * - Kontext beeinflusst Intensität, nicht Inhalte
 * - Stille ist ein Feature
 */

import { ContextMode } from '../escalation/ContextMode';

export interface UserContext {
  mode: ContextMode;
  hintBudgetPerDay?: number; // optional: wie viele Hints pro Tag
  createdAt: Date;
  updatedAt: Date;
}
