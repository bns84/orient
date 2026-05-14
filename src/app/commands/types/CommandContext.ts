/**
 * ORIENT - Command Context
 * 
 * Kontext ist explizit, nie implizit.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Kontext-Respekt
 */

import { ContextMode } from '@core/escalation/ContextMode';

export interface CommandContext {
  userId?: string; // später relevant
  contextMode: ContextMode;
  timestamp?: Date;
}
