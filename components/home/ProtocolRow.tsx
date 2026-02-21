import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../../lib/theme';
import { ProtocolWithLog } from '../../hooks/useProtocols';
import { LogStatus, HabitType } from '../../lib/constants';

interface ProtocolRowProps {
  protocol: ProtocolWithLog;
  onToggle: (habitId: string, currentStatus: LogStatus | null) => void;
  isToggling?: boolean;
  onKebabPress?: (protocol: ProtocolWithLog) => void;
}

function CheckIcon() {
  return (
    <Svg width={9} height={10} viewBox="0 0 9 10" fill="none">
      <Path
        d="M1 5L3.5 8L8 2"
        stroke={colors.indexBlue}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function KebabIcon() {
  return (
    <Svg width={4} height={16} viewBox="0 0 4 16" fill="none">
      <Path
        d="M2 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM2 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM2 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill={colors.textMuted}
      />
    </Svg>
  );
}

export function ProtocolRow({ protocol, onToggle, isToggling, onKebabPress }: ProtocolRowProps) {
  const isDone = protocol.todayLog?.status === LogStatus.DONE;
  const isPartial = protocol.todayLog?.status === LogStatus.PARTIAL;
  const isSkipped = protocol.todayLog?.status === LogStatus.SKIPPED;
  const currentStatus = protocol.todayLog?.status as LogStatus | null;

  function handleCheckboxPress() {
    if (protocol.type === HabitType.JOURNAL) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push('/journal/new');
      return;
    }
    if (protocol.type === HabitType.WORKOUT) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({ pathname: '/workout/log', params: { habitId: protocol.id } });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(protocol.id, currentStatus);
  }

  function handleKebab() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKebabPress?.(protocol);
  }

  const timeLabel = protocol.category
    ? protocol.category.toUpperCase()
    : '';
  const targetLabel = `${protocol.target_value ?? 1} ${(protocol.target_unit ?? 'count').toUpperCase()}/DAY`;
  const periodProgressLabel = protocol.periodProgress
    ? `${protocol.periodProgress.completed}/${protocol.periodProgress.target}`
    : null;
  const cadenceLabel = protocol.periodProgress
    ? `DAYS THIS ${protocol.periodProgress.window}`
    : targetLabel;
  const streakLabel = isDone && protocol.consecutiveCount > 0 ? `${protocol.consecutiveCount}D STREAK` : '';
  const categoryLabel = streakLabel.length === 0 ? timeLabel : '';
  const metaParts = [periodProgressLabel, cadenceLabel, streakLabel, categoryLabel].filter(Boolean);
  const metaLabel = metaParts.join(' · ');

  return (
    <Pressable onPress={handleCheckboxPress} disabled={isToggling} style={styles.card}>
      <View
        style={[
          styles.checkbox,
          isDone && styles.checkboxDone,
          !isDone && !isPartial && styles.checkboxEmpty,
        ]}
      >
        {isDone && <CheckIcon />}
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            isDone && styles.titleDone,
          ]}
          numberOfLines={1}
        >
          {protocol.title}
        </Text>
        <View style={styles.metaRow}>
          {protocol.consecutiveCount > 0 && !isDone && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>IN PROGRESS</Text>
            </View>
          )}
          {timeLabel.length > 0 && (
            <Text style={styles.metaText}>{metaLabel}</Text>
          )}
          {timeLabel.length === 0 && <Text style={styles.metaText}>{metaLabel}</Text>}
        </View>
      </View>

      <Pressable onPress={handleKebab} hitSlop={12} style={styles.kebab}>
        <KebabIcon />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 13,
    gap: 12,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  checkboxDone: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.5)',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  progressText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.indexBlue,
  },
  metaText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  kebab: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
