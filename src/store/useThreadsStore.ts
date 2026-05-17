/**
 * Thread-Liste im UI (Zustand) — Persistenz über SQLite-Repositories.
 */

import { create } from 'zustand';
import type { Thread } from '../core/threads/Thread';
import { ThreadStatus } from '../core/threads/ThreadStatus';
import { ThreadLifecycle } from '../core/threads/ThreadLifecycle';
import type { ThreadRepository } from '../core/threads/ThreadRepository';

export type ThreadLifecycleAction = 'activate' | 'observe' | 'dormant';

type ThreadsStoreState = {
  threads: Thread[];
  activeThreadId: string | null;
  loading: boolean;
  loadFromRepository: (repo: ThreadRepository) => Promise<void>;
  addThread: (repo: ThreadRepository, thread: Thread) => Promise<void>;
  setActiveThreadId: (id: string | null) => void;
  setStatus: (
    repo: ThreadRepository,
    threadId: string,
    action: ThreadLifecycleAction,
  ) => Promise<void>;
};

export const useThreadsStore = create<ThreadsStoreState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  loading: false,

  loadFromRepository: async (repo) => {
    set({ loading: true });
    try {
      const threads = await repo.getAll();
      threads.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
      set({ threads, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addThread: async (repo, thread) => {
    await repo.save(thread);
    await get().loadFromRepository(repo);
    set({ activeThreadId: thread.id });
  },

  setActiveThreadId: (id) => set({ activeThreadId: id }),

  setStatus: async (repo, threadId, action) => {
    const thread = (await repo.getById(threadId)) ?? get().threads.find((t) => t.id === threadId);
    if (!thread) return;

    let updated: Thread;
    switch (action) {
      case 'activate':
        updated = ThreadLifecycle.activate(thread);
        break;
      case 'observe':
        updated = ThreadLifecycle.markObserved(thread);
        break;
      case 'dormant':
        updated = ThreadLifecycle.markDormant(thread);
        break;
    }

    if (updated.status === thread.status) return;
    await repo.update(updated);
    await get().loadFromRepository(repo);
  },
}));

export function threadActionForStatus(status: ThreadStatus): ThreadLifecycleAction | null {
  switch (status) {
    case ThreadStatus.ACTIVE:
      return 'activate';
    case ThreadStatus.OBSERVED:
      return 'observe';
    case ThreadStatus.DORMANT:
      return 'dormant';
    default:
      return null;
  }
}
