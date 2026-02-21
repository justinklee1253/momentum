import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { supabase } from '../lib/supabase';
import { LogStatus, AnchorType, TIER_LABELS } from '../lib/constants';
import { Habit } from '../lib/database.types';
import { parseSchedule, protocolAppliesOnDate } from '../lib/schedule';

export interface CalendarCell {
  status: LogStatus | null;
  /** False when protocol does not apply on this day (e.g. weekly on wrong day). */
  applicable: boolean;
}

export interface CalendarRow {
  habit: Habit;
  tierLabel: string;
  cells: Record<number, CalendarCell>; // day number (1-31) -> cell
  weeklyRate: number;
}

export interface CalendarData {
  rows: CalendarRow[];
  daysInMonth: number;
  monthLabel: string;
  overallExecution: number;
  bestConsecutive: number;
}

export function useCalendarData(userId: string | null, year: number, month: number) {
  return useQuery<CalendarData>({
    queryKey: ['calendar', userId, year, month],
    enabled: !!userId,
    queryFn: async () => {
      const monthDate = new Date(year, month - 1, 1);
      const start = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      const numDays = getDaysInMonth(monthDate);

      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId!)
          .eq('active', true)
          .order('anchor_type')
          .order('created_at'),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId!)
          .gte('date', start)
          .lte('date', end),
      ]);

      const habits = habitsRes.data ?? [];
      const logs = logsRes.data ?? [];

      const logMap = new Map<string, LogStatus>();
      logs.forEach((log) => {
        logMap.set(`${log.habit_id}_${log.date}`, log.status as LogStatus);
      });

      const scheduleApplies = (h: Habit, dateStr: string) =>
        protocolAppliesOnDate(parseSchedule(h.schedule), dateStr);

      const rows: CalendarRow[] = habits.map((habit) => {
        const cells: Record<number, CalendarCell> = {};
        let doneCount = 0;
        let applicableDays = 0;
        const habitCreatedDate = habit.created_at.split('T')[0];

        for (let day = 1; day <= numDays; day++) {
          const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
          const existedYet = dateStr >= habitCreatedDate;
          const applies = existedYet && scheduleApplies(habit, dateStr);
          const status = applies ? (logMap.get(`${habit.id}_${dateStr}`) ?? null) : null;
          cells[day] = { status, applicable: applies };
          if (applies) {
            applicableDays++;
            if (status === LogStatus.DONE || status === LogStatus.PARTIAL) doneCount++;
          }
        }

        return {
          habit,
          tierLabel: TIER_LABELS[habit.anchor_type as AnchorType],
          cells,
          weeklyRate: applicableDays > 0 ? Math.round((doneCount / applicableDays) * 100) : 0,
        };
      });

      let totalCells = 0;
      let doneCells = 0;
      habits.forEach((habit) => {
        const createdDate = habit.created_at.split('T')[0];
        for (let day = 1; day <= numDays; day++) {
          const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
          if (dateStr >= createdDate && scheduleApplies(habit, dateStr)) {
            totalCells++;
            const status = logMap.get(`${habit.id}_${dateStr}`);
            if (status === LogStatus.DONE || status === LogStatus.PARTIAL) doneCells++;
          }
        }
      });
      const overallExecution = totalCells > 0 ? Math.round((doneCells / totalCells) * 100) : 0;

      let bestConsecutive = 0;
      habits.forEach((habit) => {
        const createdDate = habit.created_at.split('T')[0];
        let streak = 0;
        let best = 0;
        for (let day = numDays; day >= 1; day--) {
          const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
          if (dateStr < createdDate || !scheduleApplies(habit, dateStr)) {
            streak = 0;
            continue;
          }
          const status = logMap.get(`${habit.id}_${dateStr}`);
          if (status === LogStatus.DONE || status === LogStatus.PARTIAL) {
            streak++;
            best = Math.max(best, streak);
          } else {
            streak = 0;
          }
        }
        bestConsecutive = Math.max(bestConsecutive, best);
      });

      return {
        rows,
        daysInMonth: numDays,
        monthLabel: format(monthDate, 'MMM yyyy').toUpperCase(),
        overallExecution,
        bestConsecutive,
      };
    },
  });
}
