/**
 * ORIENT - Capture Impulse Command
 * 
 * Der wichtigste Command überhaupt.
 * Alles beginnt hier.
 * 
 * Respektiert ORIENT_DNA:
 * - Keine Bewertung
 * - Kein Klassifizieren
 * - Kein Routing
 * - Nur festhalten
 */

import { ImpulseFactory } from '@core/impulses/ImpulseFactory';
import { ImpulseLinker } from '@core/impulses/ImpulseLinker';
import { ImpulseRepository } from '@core/impulses/ImpulseRepository';
import { CommandContext } from './types/CommandContext';
import { CommandResult } from './types/CommandResult';
import { v4 as uuidv4 } from 'uuid';

export interface CaptureImpulseInput {
  text?: string;
  transcript?: string;
  payloadRef?: string;
  threadId?: string;
}

export class CaptureImpulseCommand {
  constructor(private impulseRepo: ImpulseRepository) {}

  async execute(input: CaptureImpulseInput, ctx: CommandContext): Promise<CommandResult> {
    if (!input.text && !input.transcript) {
      return { ok: false, message: 'Kein Inhalt übergeben.' };
    }

    try {
      const impulse = ImpulseFactory.create({
        id: uuidv4(),
        content: {
          text: input.text,
          transcript: input.transcript,
          payloadRef: input.payloadRef,
        },
        createdAt: ctx.timestamp ?? new Date(),
      });

      // Verknüpfung zu Thread, falls angegeben
      const linkedImpulse = input.threadId
        ? ImpulseLinker.linkToThread(impulse, input.threadId)
        : impulse;

      await this.impulseRepo.save(linkedImpulse);

      return {
        ok: true,
        affectedIds: [linkedImpulse.id],
        message: 'Gedanke gespeichert.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Fehler beim Speichern.',
      };
    }
  }
}
