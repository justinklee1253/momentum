import { create } from 'zustand';
import { JournalMode } from '../lib/constants';

interface SignalLogState {
  draftMode: JournalMode;
  draftContent: string;
  draftClarity: number;
  draftStructured: {
    executedWell: string;
    needsAdjustment: string;
    keyInsight: string;
  };

  setDraftMode: (mode: JournalMode) => void;
  setDraftContent: (content: string) => void;
  setDraftClarity: (clarity: number) => void;
  setDraftStructured: (field: keyof SignalLogState['draftStructured'], value: string) => void;
  resetDraft: () => void;
}

const initialDraft = {
  draftMode: JournalMode.OPEN,
  draftContent: '',
  draftClarity: 5,
  draftStructured: {
    executedWell: '',
    needsAdjustment: '',
    keyInsight: '',
  },
};

export const useSignalLogStore = create<SignalLogState>((set) => ({
  ...initialDraft,

  setDraftMode: (mode) => set({ draftMode: mode }),
  setDraftContent: (content) => set({ draftContent: content }),
  setDraftClarity: (clarity) => set({ draftClarity: clarity }),
  setDraftStructured: (field, value) =>
    set((state) => ({
      draftStructured: { ...state.draftStructured, [field]: value },
    })),
  resetDraft: () => set(initialDraft),
}));
