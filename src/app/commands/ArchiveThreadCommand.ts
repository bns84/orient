/**
 * ORIENT - Archive Thread Command
 * 
 * Nicht löschen. Nur ruhen lassen.
 * 
 * Respektiert ORIENT_DNA:
 * - Keine automatische Löschung
 * - Gedanken werden nicht gelöscht, nur DORMANT
 */

import { ThreadRepository } from '@core/threads/ThreadRepository';
import { ThreadLifecycle } from '@core/threads/ThreadLifecycle';
import { CommandResult } from './types/CommandResult';

export class ArchiveThreadCommand {
  constructor(private threadRepo: ThreadRepository) {}

  async execute(threadId: string): Promise<CommandResult> {
    const thread = await this.threadRepo.getById(threadId);
    if (!thread) {
      return { ok: false, message: 'Thread nicht gefunden.' };
    }

    // Thread als DORMANT markieren (nicht löschen!)
    const dormant = ThreadLifecycle.markDormant(thread);
    await this.threadRepo.update(dormant);

    return {
      ok: true,
      affectedIds: [threadId],
      message: 'Thema ruht jetzt.',
    };
  }
}
