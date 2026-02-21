import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { calendarViewStore } from '../../stores/calendarViewStore';

const minDate = new Date(2020, 0, 1);
const maxDate = new Date(2030, 11, 31);

function parseInitialDate(initialDate: string | undefined): Date {
  if (!initialDate) return new Date();
  const parsed = new Date(initialDate);
  if (Number.isNaN(parsed.getTime())) return new Date();
  if (parsed < minDate) return minDate;
  if (parsed > maxDate) return maxDate;
  return parsed;
}

export default function CalendarDatePickerScreen() {
  const params = useLocalSearchParams<{ initialDate?: string }>();
  const initialDate =
    typeof params.initialDate === 'string'
      ? params.initialDate
      : Array.isArray(params.initialDate)
        ? params.initialDate[0]
        : undefined;
  const [selectedDate, setSelectedDate] = useState(() =>
    parseInitialDate(initialDate)
  );

  function handleJumpToCurrentMonth() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    calendarViewStore.getState().setTargetDate(new Date());
    router.back();
  }

  function handleApply() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    calendarViewStore.getState().setTargetDate(selectedDate);
    router.back();
  }

  function handleCancel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }

  function onDateChange(event: { type: string } | unknown, date?: Date) {
    const evt = event as { type?: string };
    if (date && evt?.type !== 'dismissed') setSelectedDate(date);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.modalHeader}>
          <Pressable onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>JUMP TO DATE</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Jump to Current Month */}
          <Pressable
            style={({ pressed }) => [
              styles.currentMonthBtn,
              pressed && styles.currentMonthBtnPressed,
            ]}
            onPress={handleJumpToCurrentMonth}
          >
            <Text style={styles.currentMonthBtnText}>CURRENT MONTH</Text>
          </Pressable>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionLabel}>SELECT DATE</Text>
            {Platform.OS === 'android' && (
              <Text style={styles.selectedDateText}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </Text>
            )}
            <View style={styles.pickerCard}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                {...(Platform.OS === 'ios' && {
                  themeVariant: 'dark',
                  textColor: colors.textPrimary,
                  style: styles.picker,
                })}
              />
            </View>
          </View>

          {/* Apply */}
          <Pressable
            style={({ pressed }) => [
              styles.applyBtn,
              pressed && styles.applyBtnPressed,
            ]}
            onPress={handleApply}
          >
            <Text style={styles.applyBtnText}>Go</Text>
          </Pressable>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  safe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    padding: spacing.xs,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  title: {
    ...typography.micro,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 64,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  currentMonthBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  currentMonthBtnPressed: {
    opacity: 0.85,
  },
  currentMonthBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#000',
  },
  dateSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textSecondary,
  },
  selectedDateText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pickerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
  },
  applyBtn: {
    backgroundColor: colors.indexBlue,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.indexBlue,
  },
  applyBtnPressed: {
    opacity: 0.85,
  },
  applyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
