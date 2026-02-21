import { create } from 'zustand';
import { CoachingStyle } from '../lib/constants';

interface ChatState {
  activeCoachingStyle: CoachingStyle | null;
  setActiveCoachingStyle: (style: CoachingStyle) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeCoachingStyle: null,
  setActiveCoachingStyle: (style) => set({ activeCoachingStyle: style }),
}));
