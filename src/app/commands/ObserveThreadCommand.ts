/**
 * ORIENT — Thread beobachten (ACTIVE → OBSERVED)
 */

import { ThreadRepository } from '@core/threads/ThreadRepository';
import { ThreadLifecycle } from '@core/threads/ThreadLifecycle';
import { CommandResult } from './types/CommandResult';

export class ObserveThreadCommand {
  constructor(private threadRepo: ThreadRepository) {}

  async execute(threadId: string): Promise<CommandResult> {
    const thread = await this.threadRepo.getById(threadId);
    if (!thread) {
      return { ok: false, message: 'Thema nicht gefunden.' };
    }

    const updated = ThreadLifecycle.markObserved(thread);
    if (updated.status === thread.status) {
      return { ok: false, message: 'Kann gerade nicht beobachtet werden.' };
    }

    await this.threadRepo.update(updated);
    return {
      ok: true,
      affectedIds: [threadId],
      message: 'Erstmal beobachten.',
    };
  }
}
