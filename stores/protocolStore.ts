import { create } from 'zustand';
import { Habit, HabitLog } from '../lib/database.types';

interface ProtocolState {
  todayLogs: Record<string, HabitLog>;
  setTodayLogs: (logs: HabitLog[]) => void;
  updateLog: (habitId: string, log: HabitLog) => void;
}

export const useProtocolStore = create<ProtocolState>((set) => ({
  todayLogs: {},

  setTodayLogs: (logs) => {
    const map: Record<string, HabitLog> = {};
    logs.forEach((log) => { map[log.habit_id] = log; });
    set({ todayLogs: map });
  },

  updateLog: (habitId, log) =>
    set((state) => ({ todayLogs: { ...state.todayLogs, [habitId]: log } })),
}));
