export enum AnchorType {
  NON_NEGOTIABLE = 'NON_NEGOTIABLE',
  GROWTH = 'GROWTH',
  ROTATING_FOCUS = 'ROTATING_FOCUS',
}

export enum HabitType {
  GENERIC = 'GENERIC',
  JOURNAL = 'JOURNAL',
  WORKOUT = 'WORKOUT',
}

export enum ProtocolIntent {
  BUILD = 'BUILD',
  QUIT = 'QUIT',
}

export enum LogStatus {
  DONE = 'DONE',
  PARTIAL = 'PARTIAL',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
}

export enum CoachingStyle {
  DIRECT = 'DIRECT',
  STRATEGIC = 'STRATEGIC',
  DRIVEN = 'DRIVEN',
}

export enum JournalMode {
  OPEN = 'OPEN',
  STRUCTURED = 'STRUCTURED',
  SYSTEM = 'SYSTEM',
}

export const MOMENTUM_ALPHA = 0.18;
export const MOMENTUM_WINDOW = 21;

export const LOG_STATUS_VALUES: Record<LogStatus, number> = {
  [LogStatus.DONE]: 1.0,
  [LogStatus.PARTIAL]: 0.5,
  [LogStatus.SKIPPED]: 0.2,
  [LogStatus.MISSED]: 0.0,
};

export const TIER_LABELS: Record<AnchorType, string> = {
  [AnchorType.NON_NEGOTIABLE]: 'NON-NEGOTIABLE',
  [AnchorType.GROWTH]: 'GROWTH',
  [AnchorType.ROTATING_FOCUS]: 'ROTATING FOCUS',
};

export const PROTOCOL_INTENT_LABELS: Record<ProtocolIntent, string> = {
  [ProtocolIntent.BUILD]: 'BUILD',
  [ProtocolIntent.QUIT]: 'QUIT',
};

export const PROTOCOL_UNITS = [
  'count',
  'steps',
  'min',
  'hr',
  'km',
  'mile',
  'ml',
  'oz',
  'cal',
  'g',
  'mg',
  'drink',
] as const;

export type ProtocolUnit = (typeof PROTOCOL_UNITS)[number];

export const COACHING_STYLE_LABELS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: 'DIRECT',
  [CoachingStyle.STRATEGIC]: 'STRATEGIC',
  [CoachingStyle.DRIVEN]: 'DRIVEN',
};

export const COACHING_STYLE_DESCRIPTIONS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: 'Cold. Precise. Blunt.',
  [CoachingStyle.STRATEGIC]: 'Strategic. Identity-aware. Probing.',
  [CoachingStyle.DRIVEN]: 'Relentless. Energized. Loud.',
};

export const COACHING_TONE_PREVIEWS: Record<CoachingStyle, string> = {
  [CoachingStyle.DIRECT]: '"You missed 2 of 3 NON-NEGOTIABLES yesterday. Deep work block was skipped. Execute it today — no exceptions."',
  [CoachingStyle.STRATEGIC]: '"Yesterday\'s execution was at 67%. What decision are you avoiding that\'s bleeding into your mornings?"',
  [CoachingStyle.DRIVEN]: '"Deep work ran clean. Morning protocol held. That consistency is what separates operators from wishful thinkers. Push the intensity today."',
};

export const COACHING_TONE_SETTINGS: Record<CoachingStyle, { bluntness: number; empathy: number; energy: number }> = {
  [CoachingStyle.DIRECT]: { bluntness: 0.9, empathy: 0.1, energy: 0.5 },
  [CoachingStyle.STRATEGIC]: { bluntness: 0.5, empathy: 0.5, energy: 0.4 },
  [CoachingStyle.DRIVEN]: { bluntness: 0.6, empathy: 0.4, energy: 0.9 },
};

export const DEFAULT_PROTOCOLS: Array<{
  title: string;
  type: HabitType;
  anchor_type: AnchorType;
  category: string;
}> = [
  { title: 'Daily Signal Log', type: HabitType.JOURNAL, anchor_type: AnchorType.NON_NEGOTIABLE, category: 'Reflection' },
  { title: 'Deep Work Block', type: HabitType.GENERIC, anchor_type: AnchorType.NON_NEGOTIABLE, category: 'Focus' },
  { title: 'Evening Debrief', type: HabitType.GENERIC, anchor_type: AnchorType.NON_NEGOTIABLE, category: 'Reflection' },
  { title: 'Training', type: HabitType.WORKOUT, anchor_type: AnchorType.GROWTH, category: 'Health' },
  { title: 'Input', type: HabitType.GENERIC, anchor_type: AnchorType.GROWTH, category: 'Learning' },
  { title: 'Digital Discipline', type: HabitType.GENERIC, anchor_type: AnchorType.ROTATING_FOCUS, category: 'Focus' },
];

export const MOMENTUM_SCORE_LABELS = {
  LOCKED_IN: { label: 'LOCKED IN', min: 80, max: 100 },
  BUILDING: { label: 'BUILDING', min: 60, max: 79 },
  DRIFTING: { label: 'DRIFTING', min: 40, max: 59 },
  OFF_TRACK: { label: 'OFF TRACK', min: 0, max: 39 },
} as const;

export function getMomentumLabel(score: number): string {
  if (score >= 80) return 'LOCKED IN';
  if (score >= 60) return 'BUILDING';
  if (score >= 40) return 'DRIFTING';
  return 'OFF TRACK';
}
