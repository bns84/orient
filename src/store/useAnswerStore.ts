/**
 * Antwort des Pförtners, die unter der Bubble steht.
 */

import { create } from 'zustand';
import { askPfoertner, cancelPfoertner } from '../services/orient/orientClient';
import { useAppStore } from './useAppStore';

interface AnswerState {
  text: string;
  thinking: boolean;
  requestId: string | null;
  ask: (text: string, source: 'voice' | 'text') => Promise<void>;
  cancel: () => void;
  clear: () => void;
}

export const useAnswerStore = create<AnswerState>((set, get) => ({
  text: '',
  thinking: false,
  requestId: null,

  async ask(text, source) {
    const requestId = crypto.randomUUID();
    set({ thinking: true, requestId });
    const companionName = useAppStore.getState().companionName;
    const res = await askPfoertner({ text, source, requestId, companionName });

    // Wurde nachgeschoben, läuft die neue Anfrage weiter; diese Antwort zählt nicht mehr.
    if (res.status === 'cancelled') {
      if (!res.replacedBy) set({ thinking: false, requestId: null });
      return;
    }
    set({ text: res.answer, thinking: false, requestId: null });
  },

  cancel() {
    const id = get().requestId;
    if (id) void cancelPfoertner(id);
    set({ thinking: false, requestId: null });
  },

  clear() {
    set({ text: '' });
  },
}));
