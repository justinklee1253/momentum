import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import type { Schedule } from '../../lib/schedule';

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type FrequencyKind = 'daily' | 'weekly' | 'days_per_week' | 'monthly' | 'days_per_month';

const OPTIONS: { kind: FrequencyKind; label: string }[] = [
  { kind: 'daily', label: 'Every Day' },
  { kind: 'weekly', label: 'Specific days of the week' },
  { kind: 'days_per_week', label: 'Number of days per week' },
  { kind: 'monthly', label: 'Specific days of the month' },
  { kind: 'days_per_month', label: 'Number of days per month' },
];

function scheduleToKind(s: Schedule): FrequencyKind {
  switch (s.frequency) {
    case 'daily': return 'daily';
    case 'weekly': return 'weekly';
    case 'days_per_week': return 'days_per_week';
    case 'monthly': return 'monthly';
    case 'days_per_month': return 'days_per_month';
    default: return 'daily';
  }
}

export interface RecurrenceSelectorProps {
  value: Schedule;
  onChange: (schedule: Schedule) => void;
  compact?: boolean;
}

export function RecurrenceSelector({ value, onChange, compact }: RecurrenceSelectorProps) {
  const selectedKind = scheduleToKind(value);

  const selectOption = useCallback((kind: FrequencyKind) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (kind) {
      case 'daily':
        onChange({ frequency: 'daily' });
        break;
      case 'weekly':
        onChange({ frequency: 'weekly', days: value.frequency === 'weekly' ? value.days : [] });
        break;
      case 'days_per_week':
        onChange({ frequency: 'days_per_week', count: value.frequency === 'days_per_week' ? value.count : 0 });
        break;
      case 'monthly':
        onChange({ frequency: 'monthly', days: value.frequency === 'monthly' ? value.days : [] });
        break;
      case 'days_per_month':
        onChange({ frequency: 'days_per_month', count: value.frequency === 'days_per_month' ? value.count : 0 });
        break;
    }
  }, [value, onChange]);

  return (
    <View style={compact ? styles.compact : styles.wrapper}>
      <Text style={styles.sectionLabel}>RECURRENCE</Text>
      <View style={styles.optionsList}>
        {OPTIONS.map(({ kind, label }) => {
          const isSelected = selectedKind === kind;
          return (
            <View key={kind} style={styles.optionCardWrap}>
              <Pressable
                onPress={() => selectOption(kind)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {label}
                </Text>
              </Pressable>
              {isSelected && kind === 'weekly' && (
                <View style={styles.subRow}>
                  <View style={styles.chipRow}>
                    {WEEKDAY_LABELS.map((dayLabel, i) => {
                      const days = value.frequency === 'weekly' ? value.days : [];
                      const on = days.includes(i);
                      return (
                        <Pressable
                          key={i}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const next = on ? days.filter((d) => d !== i) : [...days, i].sort((a, b) => a - b);
                            onChange(next.length ? { frequency: 'weekly', days: next } : { frequency: 'daily' });
                          }}
                          style={[styles.chip, on && styles.chipSelected]}
                        >
                          <Text style={[styles.chipText, on && styles.chipTextSelected]}>{dayLabel}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
              {isSelected && kind === 'days_per_week' && (
                <View style={styles.subRow}>
                  <View style={styles.stepperRow}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const c = value.frequency === 'days_per_week' ? value.count : 0;
                        if (c > 0) onChange({ frequency: 'days_per_week', count: c - 1 });
                      }}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepperValue}>
                      {value.frequency === 'days_per_week' ? value.count : 0}
                    </Text>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const c = value.frequency === 'days_per_week' ? value.count : 0;
                        if (c < 7) onChange({ frequency: 'days_per_week', count: c + 1 });
                      }}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.hint}>
                    Complete on any {value.frequency === 'days_per_week' ? value.count : 0} days of the week
                  </Text>
                </View>
              )}
              {isSelected && kind === 'monthly' && (
                <View style={styles.subRow}>
                  <View style={styles.monthGrid}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const days = value.frequency === 'monthly' ? value.days : [];
                      const on = days.includes(d);
                      return (
                        <Pressable
                          key={d}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const next = on ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => a - b);
                            onChange(next.length ? { frequency: 'monthly', days: next } : { frequency: 'daily' });
                          }}
                          style={[styles.monthDay, on && styles.monthDaySelected]}
                        >
                          <Text style={[styles.monthDayText, on && styles.monthDayTextSelected]}>{d}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
              {isSelected && kind === 'days_per_month' && (
                <View style={styles.subRow}>
                  <View style={styles.stepperRow}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const c = value.frequency === 'days_per_month' ? value.count : 0;
                        if (c > 0) onChange({ frequency: 'days_per_month', count: c - 1 });
                      }}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepperValue}>
                      {value.frequency === 'days_per_month' ? value.count : 0}
                    </Text>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const c = value.frequency === 'days_per_month' ? value.count : 0;
                        if (c < 7) onChange({ frequency: 'days_per_month', count: c + 1 });
                      }}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.hint}>
                    Complete on any {value.frequency === 'days_per_month' ? value.count : 0} days of the month
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  compact: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCardWrap: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.borderActive,
    backgroundColor: colors.accentMuted,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: colors.textPrimary,
  },
  subRow: {
    paddingLeft: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.borderActive,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepperValue: {
    ...typography.subhead,
    color: colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthDay: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDaySelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.borderActive,
  },
  monthDayText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  monthDayTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
