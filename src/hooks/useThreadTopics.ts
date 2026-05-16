/**
 * Themen aus Thread-Snapshots (Memory-Repo) — für TopicList
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { ThreadStatus } from '../core/threads/ThreadStatus';

export type ThreadTopicCard = {
  key: string;
  title: string;
  subtitle?: string;
  summary?: string;
  bullets?: string[];
  isNew?: boolean;
};

export function useThreadTopics() {
  const { threadRepo, threadQuery, contextService } = useAppServices();
  const [topics, setTopics] = useState<ThreadTopicCard[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const ctx = await contextService.getCurrent();
      const threads = await threadRepo.getAll();
      const opts = {
        contextMode: ctx.mode,
        allowHints: true,
        hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
      };

      const cards: ThreadTopicCard[] = [];
      for (const thread of threads) {
        const snapshot = await threadQuery.getThreadSnapshot(thread.id, opts);
        cards.push({
          key: thread.id,
          title: thread.title,
          subtitle: thread.status,
          summary: snapshot?.summary,
          bullets: snapshot?.highlights,
          isNew:
            thread.status === ThreadStatus.ACTIVE &&
            (snapshot?.provenance.impulseCount ?? 0) === 0,
        });
      }

      cards.sort((a, b) => a.title.localeCompare(b.title, 'de'));
      setTopics(cards);
    } finally {
      setLoading(false);
    }
  }, [threadRepo, threadQuery, contextService]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { topics, loading, reload };
}
