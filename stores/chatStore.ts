import { create } from 'zustand';
import { CoachingStyle } from '../lib/constants';

interface ChatState {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeCoachingStyle: CoachingStyle | null;
  setActiveCoachingStyle: (style: CoachingStyle) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeCoachingStyle: null,
  setActiveCoachingStyle: (style) => set({ activeCoachingStyle: style }),
}));
