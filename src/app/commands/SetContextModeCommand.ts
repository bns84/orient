/**
 * ORIENT - Set Context Mode Command
 * 
 * "Ich bin auf einer Party / bei Familie / brauche Ruhe"
 * 
 * Respektiert ORIENT_DNA:
 * - Kontext-Respekt
 * - Stille ist ein Feature
 */

import { ContextMode } from '@core/escalation/ContextMode';
import { CommandContext } from './types/CommandContext';
import { CommandResult } from './types/CommandResult';

export class SetContextModeCommand {
  async execute(mode: ContextMode, ctx: CommandContext): Promise<CommandResult> {
    // Phase 1: Rückgabe, Persistenz später
    // DNA: Kontext beeinflusst nur Intensität, nie Inhalte
    return {
      ok: true,
      message: `Kontext auf ${mode} gesetzt.`,
    };
  }
}
