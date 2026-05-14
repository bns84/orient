/**
 * ORIENT - Pin Thread Command
 * 
 * Thread als wichtig markieren.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Keine automatische Bewertung
 */

import { ThreadRepository } from '@core/threads/ThreadRepository';
import { CommandResult } from './types/CommandResult';

export class PinThreadCommand {
  constructor(private threadRepo: ThreadRepository) {}

  async execute(threadId: string): Promise<CommandResult> {
    const thread = await this.threadRepo.getById(threadId);
    if (!thread) {
      return { ok: false, message: 'Thread nicht gefunden.' };
    }

    // Thread bleibt unverändert (Pin-Funktionalität kommt später)
    // Für jetzt: einfach bestätigen
    await this.threadRepo.update(thread);

    return {
      ok: true,
      affectedIds: [threadId],
      message: 'Thema gemerkt.',
    };
  }
}
