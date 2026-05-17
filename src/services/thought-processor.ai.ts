/**
 * Optionaler KI-Anreicherungs-Stub — blockiert nie die UI.
 */

import type { Thread } from '../core/threads/Thread';
import type { ThreadRepository } from '../core/threads/ThreadRepository';
import { isAiEnrichmentEnabled } from './ai/aiClient';
import { enrichThoughtWithAi } from './ai/enrichThought';

export type { AiThoughtHint } from './ai/types';
export { isAiEnrichmentEnabled } from './ai/aiClient';

export function maybeEnrichThoughtWithAi(params: {
  thread: Thread;
  text: string;
  threadRepo: ThreadRepository;
  companionName?: string;
}): void {
  if (!isAiEnrichmentEnabled() || !params.text.trim()) return;

  void enrichThoughtWithAi({
    thread: params.thread,
    text: params.text,
    threadRepo: params.threadRepo,
    companionName: params.companionName ?? 'ORIENT',
  }).catch(() => {
    // still: keine UI-Fehler
  });
}
