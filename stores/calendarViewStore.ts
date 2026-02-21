import { create } from 'zustand';

interface CalendarViewState {
  targetDate: Date | null;
  setTargetDate: (date: Date | null) => void;
}

export const calendarViewStore = create<CalendarViewState>((set) => ({
  targetDate: null,
  setTargetDate: (date) => set({ targetDate: date }),
}));
