/**
 * ORIENT - Capture Impulse Command
 *
 * Impuls festhalten + lokale Thread-Zuordnung (ThoughtProcessor).
 */

import { ImpulseFactory } from '@core/impulses/ImpulseFactory';
import { ImpulseLinker } from '@core/impulses/ImpulseLinker';
import { ImpulseRepository } from '@core/impulses/ImpulseRepository';
import type { Impulse } from '@core/impulses/Impulse';
import { CommandContext } from './types/CommandContext';
import { CommandResult } from './types/CommandResult';
import { v4 as uuidv4 } from 'uuid';
import { recordTopicEngagement } from '../../db/interest';
import { afterImpulseInCollection } from '../../services/auto-topic-engine';
import {
  processCapturedThought,
  type ThoughtProcessorDeps,
} from '../../services/thought-processor';

export interface CaptureImpulseInput {
  text?: string;
  transcript?: string;
  payloadRef?: string;
  threadId?: string;
}

export class CaptureImpulseCommand {
  constructor(
    private impulseRepo: ImpulseRepository,
    private thoughtDeps?: ThoughtProcessorDeps,
  ) {}

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

      let linkedImpulse: Impulse = input.threadId
        ? ImpulseLinker.linkToThread(impulse, input.threadId)
        : impulse;

      await this.impulseRepo.save(linkedImpulse);

      let threadTitle: string | undefined;

      if (this.thoughtDeps) {
        const processed = await processCapturedThought(linkedImpulse, this.thoughtDeps, {
          explicitThreadId: input.threadId,
        });
        linkedImpulse = processed.impulse;
        threadTitle = processed.threadTitle;
        if (processed.threadId) {
          await this.impulseRepo.save(linkedImpulse);
        }
      }

      if (!linkedImpulse.links.threadIds[0] && this.thoughtDeps) {
        const auto = await afterImpulseInCollection(linkedImpulse, {
          ...this.thoughtDeps,
          impulseRepo: this.impulseRepo,
        });
        if (auto.lastThreadTitle) threadTitle = auto.lastThreadTitle;
        linkedImpulse = (await this.impulseRepo.getById(linkedImpulse.id)) ?? linkedImpulse;
      }

      const threadKey = linkedImpulse.links.threadIds[0];
      if (threadKey) {
        await recordTopicEngagement(threadKey, 'impulse');
      }

      return {
        ok: true,
        affectedIds: [linkedImpulse.id],
        message: threadTitle ? `Gespeichert · ${threadTitle}` : 'Gedanke gespeichert.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Fehler beim Speichern.',
      };
    }
  }
}
