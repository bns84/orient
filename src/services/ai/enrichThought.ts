import type { Thread } from '../../core/threads/Thread';
import type { ThreadRepository } from '../../core/threads/ThreadRepository';
import { logEvent } from '../../db/events';
import { aiJsonComplete } from './aiClient';
import type { AiThoughtHint } from './types';

export async function enrichThoughtWithAi(params: {
  thread: Thread;
  text: string;
  threadRepo: ThreadRepository;
  companionName: string;
}): Promise<void> {
  const hint = await aiJsonComplete<AiThoughtHint>({
    task: 'enrich_thought',
    companionName: params.companionName,
    userPrompt: JSON.stringify({
      instruction:
        'Analysiere den Gedanken. Antwort als JSON: { topic, relatedTopics[], category, importance }',
      threadTitle: params.thread.title,
      thought: params.text.slice(0, 2000),
    }),
  });

  if (!hint) return;

  const tagParts = [
    hint.category,
    ...(hint.relatedTopics ?? []),
    hint.importance ? `prio:${hint.importance}` : undefined,
  ].filter((t): t is string => Boolean(t && t.trim()));

  const tags = [...new Set([...(params.thread.tags ?? []), ...tagParts])].slice(0, 12);

  const updated: Thread = {
    ...params.thread,
    tags,
    description: hint.topic?.trim() || params.thread.description,
    updatedAt: new Date(),
  };

  await params.threadRepo.update(updated);
  await logEvent('thought.ai.enriched', {
    threadId: params.thread.id,
    tags: tags.length,
  });
}
