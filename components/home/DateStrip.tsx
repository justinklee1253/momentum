import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../lib/theme';

interface DateStripProps {
  selectedDate: Date;
  onSelect?: (date: Date) => void;
}

export function DateStrip({ selectedDate, onSelect }: DateStripProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 6 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {weekDays.map((date, index) => {
        const isSelected = isToday(date);
        const isPast = date < new Date() && !isSelected;
        const dayName = format(date, 'EEE').toUpperCase();
        const dayNum = format(date, 'd');

        return (
          <Pressable
            key={index}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect?.(date);
            }}
            style={[
              styles.dayPill,
              isSelected && styles.dayPillSelected,
              !isSelected && styles.dayPillDefault,
              isPast && !isSelected && styles.dayPillPast,
            ]}
          >
            <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
              {dayName}
            </Text>
            <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
              {dayNum}
            </Text>
            {isSelected && <View style={styles.todayDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  dayPill: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  dayPillDefault: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayPillSelected: {
    backgroundColor: colors.indexBlue,
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  dayPillPast: {
    opacity: 0.7,
  },
  dayName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dayNumSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
});
