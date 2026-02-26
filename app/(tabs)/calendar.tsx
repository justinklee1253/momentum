import React, { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { UserIcon } from '../../components/UserIcon';
import {
  format,
  addMonths,
  subMonths,
  getDay,
  getDaysInMonth,
  isSameDay,
  isAfter,
} from 'date-fns';
import { colors, spacing, radius } from '../../lib/theme';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useUserId } from '../../hooks/useUserId';
import { useMetrics } from '../../hooks/useMetrics';
import { LogStatus } from '../../lib/constants';
import { Skeleton } from '../../components/ui/Skeleton';
import { calendarViewStore } from '../../stores/calendarViewStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const CELL_GAP = 4;
const CELL_SIZE = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - CELL_GAP * 6) / 7
);

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// --------------- Icons ---------------

function BoltIcon() {
  return (
    <Svg width={10} height={11.43} viewBox="0 0 26.25 30.0011" fill="none">
      <Path
        d="M20.4727 2.61381C20.8184 1.81108 20.5605 0.873577 19.8516 0.357952C19.1426 -0.157673 18.1758 -0.110798 17.5137 0.463421L2.51367 13.5884C1.92773 14.104 1.7168 14.9302 1.99219 15.6568C2.26758 16.3833 2.9707 16.8755 3.75 16.8755H10.2832L5.77734 27.3872C5.43164 28.19 5.68945 29.1275 6.39844 29.6431C7.10742 30.1587 8.07422 30.1119 8.73633 29.5376L23.7363 16.4126C24.3223 15.897 24.5332 15.0708 24.2578 14.3443C23.9824 13.6177 23.2852 13.1314 22.5 13.1314H15.9668L20.4727 2.61381V2.61381"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronLeftIcon() {
  return (
    <Svg width={9} height={14} viewBox="0 0 9 14" fill="none">
      <Path
        d="M7.5 1L1.5 7l6 6"
        stroke={colors.textSecondary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={9} height={14} viewBox="0 0 9 14" fill="none">
      <Path
        d="M1.5 1l6 6-6 6"
        stroke={colors.textSecondary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={9} height={10} viewBox="0 0 14 16" fill="none">
      <Path
        d="M1 6h12M4 1v2M10 1v2M2 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --------------- Types ---------------

type DayStatus = 'complete' | 'partial' | 'missed' | 'today' | 'neutral' | 'outside';

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  status: DayStatus;
}

// --------------- Header ---------------

function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable
        style={styles.headerLeft}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.navigate('/(tabs)/');
        }}
      >
        <LinearGradient
          colors={['#3B82F6', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <BoltIcon />
        </LinearGradient>
        <View>
          <Text style={styles.logoText}>MOMENTUM</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM ACTIVE</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.searchBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <SearchIcon />
        </Pressable>

        <Pressable
          style={styles.avatarWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          }}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <UserIcon size={18} color={colors.textSecondary} />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// --------------- Helpers ---------------

function computeGridDays(
  data: ReturnType<typeof useCalendarData>['data'] | undefined,
  year: number,
  month: number,
  today: Date
): DayData[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDow = getDay(firstOfMonth);
  const daysInMonth = getDaysInMonth(firstOfMonth);

  const prevMonthDate = new Date(year, month - 2, 1);
  const prevDaysInMonth = getDaysInMonth(prevMonthDate);

  const days: DayData[] = [];

  for (let i = 0; i < startDow; i++) {
    days.push({
      day: prevDaysInMonth - startDow + 1 + i,
      isCurrentMonth: false,
      isToday: false,
      isFuture: false,
      status: 'outside',
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const isToday = isSameDay(date, today);
    const isFuture = isAfter(date, today);

    let status: DayStatus = isToday ? 'today' : 'neutral';

    if (data && data.rows.length > 0) {
      const applicableCells = data.rows
        .map((row) => row.cells[d])
        .filter((c) => c?.applicable !== false);
      const protocolStatuses = applicableCells.map((c) => c?.status ?? null);

      if (!isFuture && protocolStatuses.length > 0) {
        const allDone = protocolStatuses.every(
          (s) => s === LogStatus.DONE
        );
        const atLeastOneDoneOrPartial = protocolStatuses.some(
          (s) => s === LogStatus.DONE || s === LogStatus.PARTIAL
        );

        if (allDone) {
          status = 'complete';
        } else if (atLeastOneDoneOrPartial) {
          status = 'partial';
        } else if (!isToday) {
          status = 'missed';
        }
        // Today with 0 protocols done: status remains 'today' (blue)
      }
    }

    days.push({
      day: d,
      isCurrentMonth: true,
      isToday,
      isFuture,
      status,
    });
  }

  const remainder = days.length % 7;
  if (remainder > 0) {
    const trailing = 7 - remainder;
    for (let i = 1; i <= trailing; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isFuture: true,
        status: 'outside',
      });
    }
  }

  return days;
}

function getCellStyles(status: DayStatus) {
  switch (status) {
    case 'complete':
      return {
        bg: 'rgba(16,185,129,0.2)',
        border: 'rgba(16,185,129,0.4)',
        textColor: '#FFFFFF',
        fontWeight: '700' as const,
      };
    case 'partial':
      return {
        bg: 'rgba(234,179,8,0.2)',
        border: 'rgba(234,179,8,0.4)',
        textColor: '#FFFFFF',
        fontWeight: '700' as const,
      };
    case 'missed':
      return {
        bg: 'rgba(239,68,68,0.2)',
        border: 'rgba(239,68,68,0.4)',
        textColor: '#FFFFFF',
        fontWeight: '700' as const,
      };
    case 'today':
      return {
        bg: '#3B82F6',
        border: '#3B82F6',
        textColor: '#FFFFFF',
        fontWeight: '700' as const,
      };
    case 'neutral':
      return {
        bg: colors.input,
        border: colors.border,
        textColor: colors.textSecondary,
        fontWeight: '500' as const,
      };
    case 'outside':
      return {
        bg: 'rgba(24,24,27,0.3)',
        border: 'transparent',
        textColor: colors.textSecondary,
        fontWeight: '500' as const,
      };
  }
}

// --------------- Day Cell ---------------

const upcomingCellStyle = {
  backgroundColor: 'rgba(59,130,246,0.06)' as const,
  borderColor: 'rgba(59,130,246,0.25)' as const,
  borderStyle: 'dashed' as const,
};

function DayCell({ data }: { data: DayData }) {
  const cellStyle = getCellStyles(data.status);
  const isOutside = data.status === 'outside';
  const isUpcoming = data.status === 'neutral' && data.isFuture;

  return (
    <View
      style={[
        styles.cell,
        isUpcoming
          ? {
              ...upcomingCellStyle,
              borderWidth: 1,
              opacity: 1,
            }
          : {
              backgroundColor: cellStyle.bg,
              borderColor: cellStyle.border,
              borderWidth: data.status === 'today' ? 2 : 1,
              opacity: isOutside ? 0.4 : 1,
            },
      ]}
    >
      <Text
        style={[
          styles.cellText,
          {
            color: cellStyle.textColor,
            fontWeight: cellStyle.fontWeight,
            fontFamily:
              cellStyle.fontWeight === '700'
                ? 'Inter_700Bold'
                : 'Inter_500Medium',
          },
        ]}
      >
        {data.day}
      </Text>

      {data.isToday && (
        <View style={styles.todayIndicator} />
      )}
    </View>
  );
}

// --------------- Main Component ---------------

export default function CalendarTab() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const metrics = useMetrics(userId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastClickedSegment, setLastClickedSegment] = useState<
    'filter' | 'today'
  >('today');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data, isLoading, refetch } = useCalendarData(userId, year, month);
  const today = useMemo(() => new Date(), []);

  const gridDays = useMemo(
    () => computeGridDays(data ?? undefined, year, month, today),
    [data, year, month, today]
  );

  function prevMonth() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(subMonths(currentDate, 1));
  }

  function nextMonth() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate(addMonths(currentDate, 1));
  }

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['calendar', userId] });
      const target = calendarViewStore.getState().targetDate;
      if (target) {
        setCurrentDate(new Date(target.getFullYear(), target.getMonth(), 1));
        setLastClickedSegment('filter');
        calendarViewStore.getState().setTargetDate(null);
      }
    }, [queryClient, userId])
  );

  function openDatePicker() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLastClickedSegment('filter');
    router.push({
      pathname: '/calendar/date-picker',
      params: { initialDate: currentDate.toISOString() },
    });
  }

  function jumpToToday() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLastClickedSegment('today');
    setCurrentDate(new Date());
  }

  const isViewingCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  const isFilterHighlighted = lastClickedSegment === 'filter';
  const isTodayHighlighted =
    lastClickedSegment === 'today' && isViewingCurrentMonth;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
          />
        }
      >
        {/* Month Title + Nav */}
        <View style={styles.monthSection}>
          <View style={styles.monthTitleWrap}>
            <View>
              <Text style={styles.monthTitle}>
                {format(currentDate, 'MMMM yyyy')}
              </Text>
              <Text style={styles.monthSubtitle}>EXECUTION CALENDAR</Text>
            </View>
            <View style={styles.navRow}>
              <Pressable style={styles.navBtn} onPress={prevMonth}>
                <ChevronLeftIcon />
              </Pressable>
              <Pressable style={styles.navBtn} onPress={nextMonth}>
                <ChevronRightIcon />
              </Pressable>
            </View>
          </View>

          {/* Segmented Control */}
          <View style={styles.segmentedRow}>
            <Pressable
              style={[
                styles.segmentBtn,
                isFilterHighlighted && styles.segmentBtnActive,
              ]}
              onPress={openDatePicker}
            >
              <CalendarIcon
                color={
                  isFilterHighlighted ? '#FFFFFF' : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  isFilterHighlighted && styles.segmentTextActive,
                ]}
              >
                Filter
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentBtn,
                isTodayHighlighted && styles.segmentBtnActive,
              ]}
              onPress={jumpToToday}
            >
              <CalendarIcon
                color={
                  isTodayHighlighted ? '#FFFFFF' : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.segmentText,
                  isTodayHighlighted && styles.segmentTextActive,
                ]}
              >
                Today
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.gridSection}>
          {isLoading ? (
            <View style={{ gap: spacing.sm }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  height={CELL_SIZE}
                  style={{ borderRadius: radius.sm }}
                />
              ))}
            </View>
          ) : (
            <>
              {/* Day Headers */}
              <View style={styles.dayHeaderRow}>
                {DAY_LABELS.map((label, i) => (
                  <View key={i} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{label}</Text>
                  </View>
                ))}
              </View>

              {/* Grid */}
              <View style={styles.grid}>
                {gridDays.map((day, i) => (
                  <DayCell key={i} data={day} />
                ))}
              </View>
            </>
          )}

          {/* Execution Legend */}
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>EXECUTION LEGEND</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: 'rgba(16,185,129,0.2)',
                      borderColor: 'rgba(16,185,129,0.4)',
                    },
                  ]}
                />
                <Text style={styles.legendLabel}>All protocols completed</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: 'rgba(234,179,8,0.2)',
                      borderColor: 'rgba(234,179,8,0.4)',
                    },
                  ]}
                />
                <Text style={styles.legendLabel}>Partial completion</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: 'rgba(239,68,68,0.2)',
                      borderColor: 'rgba(239,68,68,0.4)',
                    },
                  ]}
                />
                <Text style={styles.legendLabel}>Missed protocols</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: '#3B82F6',
                      borderColor: '#3B82F6',
                      borderWidth: 2,
                      position: 'relative',
                    },
                  ]}
                >
                  <View style={styles.legendTodayDot} />
                </View>
                <Text style={styles.legendLabel}>Today (white dot in square)</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <Text style={styles.legendLabel}>Before Momentum</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor: 'rgba(59,130,246,0.06)',
                      borderColor: 'rgba(59,130,246,0.25)',
                      borderStyle: 'dashed',
                    },
                  ]}
                />
                <Text style={styles.legendLabel}>Upcoming</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingBottom: 13,
    backgroundColor: 'rgba(24,24,27,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#EDEDED',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {},
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.3)',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Content
  scrollContent: {
    paddingBottom: 100,
  },

  // Month Section
  monthSection: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  monthTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  monthSubtitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.225,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  navRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Segmented Control
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderColor: 'rgba(59,130,246,0.5)',
  },
  segmentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },

  // Grid Section
  gridSection: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
    gap: 8,
  },

  // Day Headers
  dayHeaderRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  dayHeaderCell: {
    width: CELL_SIZE,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    lineHeight: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Calendar Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
  },
  todayIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  // Legend Card
  legendCard: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingTop: 29,
    paddingBottom: 17,
    gap: 12,
    marginTop: 8,
  },
  legendTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  legendItems: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendTodayDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  legendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#EDEDED',
  },
});
