import { create } from 'zustand';
import { CoachingStyle } from '../lib/constants';

interface GoalItem {
  text: string;
  priority: number;
}

interface OnboardingState {
  identityStatement: string;
  idealDay: string;
  goalsWeek: GoalItem[];
  selectedProtocolIds: string[];
  coachingStyle: CoachingStyle;

  setIdentityStatement: (value: string) => void;
  setIdealDay: (value: string) => void;
  setGoalsWeek: (goals: GoalItem[]) => void;
  setSelectedProtocolIds: (ids: string[]) => void;
  setCoachingStyle: (style: CoachingStyle) => void;
  reset: () => void;
}

const initialState = {
  identityStatement: '',
  idealDay: '',
  goalsWeek: [],
  selectedProtocolIds: [],
  coachingStyle: CoachingStyle.DIRECT,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setIdentityStatement: (value) => set({ identityStatement: value }),
  setIdealDay: (value) => set({ idealDay: value }),
  setGoalsWeek: (goals) => set({ goalsWeek: goals }),
  setSelectedProtocolIds: (ids) => set({ selectedProtocolIds: ids }),
  setCoachingStyle: (style) => set({ coachingStyle: style }),
  reset: () => set(initialState),
}));
