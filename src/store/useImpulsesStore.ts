/**
 * Impulse-Cache im UI — Schreiben über SQLite-Repository.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Impulse } from '../core/impulses/Impulse';
import { ImpulseFactory } from '../core/impulses/ImpulseFactory';
import { ImpulseLinker } from '../core/impulses/ImpulseLinker';
import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';

type ImpulsesStoreState = {
  recent: Impulse[];
  loading: boolean;
  loadRecent: (repo: ImpulseRepository, limit?: number) => Promise<void>;
  addImpulse: (
    repo: ImpulseRepository,
    content: { text?: string; transcript?: string },
    threadIds?: string[],
  ) => Promise<Impulse>;
};

export const useImpulsesStore = create<ImpulsesStoreState>((set, get) => ({
  recent: [],
  loading: false,

  loadRecent: async (repo, limit = 48) => {
    set({ loading: true });
    try {
      const recent = await repo.findRecent(limit);
      set({ recent, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addImpulse: async (repo, content, threadIds = []) => {
    let impulse = ImpulseFactory.create({
      id: uuidv4(),
      content,
      createdAt: new Date(),
    });
    for (const threadId of threadIds) {
      impulse = ImpulseLinker.linkToThread(impulse, threadId);
    }
    await repo.save(impulse);
    await get().loadRecent(repo);
    return impulse;
  },
}));
