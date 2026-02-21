export const colors = {
  // Surfaces
  base: '#09090B',
  card: '#111113',
  input: '#18181B',
  overlay: '#000000CC',

  // Primary accent — emerald execution color
  accent: '#10B981',
  accentMuted: 'rgba(16,185,129,0.15)',
  accentDim: 'rgba(16,185,129,0.08)',

  // Momentum Index gauge — blue
  indexBlue: '#3B82F6',
  indexBlueMuted: 'rgba(59,130,246,0.15)',

  // Text
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',

  // Borders
  border: '#27272A',
  borderActive: 'rgba(16,185,129,0.3)',

  // Execution status
  statusDone: '#10B981',
  statusPartial: '#A1A1AA',
  statusSkipped: '#27272A',
  statusMissed: '#3F3F46',

  // Protocol tier accents
  tierNonNeg: '#EF4444',
  tierGrowth: '#10B981',
  tierRotating: '#3B82F6',

  // Coaching style accents
  direct: '#EF4444',
  strategic: '#3B82F6',
  driven: '#10B981',

  // Calibration slider semantic colors
  sliderSleep: '#8B5CF6',
  sliderEnergy: '#06B6D4',
  sliderWorkload: '#10B981',
  sliderStress: '#EF4444',
  sliderFocus: '#3B82F6',
  sliderRecovery: '#14B8A6',

  // Signal/action accents
  signalOrange: '#F97316',
  signalOrangeMuted: 'rgba(249,115,22,0.15)',

  // Neon orange (TODAY button)
  neonOrange: '#FF6B35',
  neonOrangeMuted: 'rgba(255,107,53,0.2)',
  neonOrangeBorder: 'rgba(255,107,53,0.4)',

  // App identity
  brandPurple: '#7C3AED',
};

export const typography = {
  micro: { fontSize: 11, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' as const },
  caption: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 15, lineHeight: 22 },
  subhead: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  metricHero: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  systemScore: { fontSize: 48, lineHeight: 52, fontWeight: '700' as const },
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
};
