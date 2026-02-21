import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Habit, HabitLog } from '../lib/database.types';
import { LogStatus, AnchorType } from '../lib/constants';
import { getConsecutiveCount, DayLog } from '../lib/formulas';
import { parseSchedule, protocolAppliesOnDate, Schedule } from '../lib/schedule';

type PeriodProgress = {
  completed: number;
  target: number;
  window: 'WEEK' | 'MONTH';
};

export interface ProtocolWithLog extends Habit {
  todayLog: HabitLog | null;
  consecutiveCount: number;
  periodProgress: PeriodProgress | null;
}

export interface ProtocolsData {
  protocols: ProtocolWithLog[];
  byTier: Record<AnchorType, ProtocolWithLog[]>;
  todayRatio: number;
}

export function useProtocols(userId: string | null) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const isCompletedStatus = (status: LogStatus) => status === LogStatus.DONE || status === LogStatus.PARTIAL;

  const countCompletedForRange = (logs: DayLog[], startDate: string, endDate: string) =>
    logs.filter((log) => log.date >= startDate && log.date <= endDate && isCompletedStatus(log.status)).length;

  const getPeriodProgress = (schedule: Schedule, logs: DayLog[], weekStart: string, monthStart: string, endDate: string): PeriodProgress | null => {
    if (schedule.frequency === 'days_per_week') {
      return {
        completed: countCompletedForRange(logs, weekStart, endDate),
        target: schedule.count,
        window: 'WEEK',
      };
    }
    if (schedule.frequency === 'days_per_month') {
      return {
        completed: countCompletedForRange(logs, monthStart, endDate),
        target: schedule.count,
        window: 'MONTH',
      };
    }
    return null;
  };

  const query = useQuery<ProtocolsData>({
    queryKey: ['protocols', userId, today],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const weekStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
      const monthStartDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const lookbackDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 60));
      const weekStart = format(weekStartDate, 'yyyy-MM-dd');
      const monthStart = format(monthStartDate, 'yyyy-MM-dd');
      const lookbackStart = format(lookbackDate, 'yyyy-MM-dd');

      const [habitsRes, logsRes, allLogsRes] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId!)
          .eq('active', true)
          .order('created_at', { ascending: true }),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId!)
          .eq('date', today),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId!)
          .gte('date', lookbackStart),
      ]);

      const habits = habitsRes.data ?? [];
      const todayLogs = logsRes.data ?? [];
      const allLogs = allLogsRes.data ?? [];

      const todayLogMap = new Map<string, HabitLog>();
      todayLogs.forEach((log) => todayLogMap.set(log.habit_id, log));

      const allLogsMap = new Map<string, DayLog[]>();
      allLogs.forEach((log) => {
        const arr = allLogsMap.get(log.habit_id) ?? [];
        arr.push({ date: log.date, status: log.status as LogStatus });
        allLogsMap.set(log.habit_id, arr);
      });

      const allProtocols: ProtocolWithLog[] = habits.map((habit) => {
        const habitLogs = allLogsMap.get(habit.id) ?? [];
        const schedule = parseSchedule(habit.schedule);
        return {
          ...habit,
          todayLog: todayLogMap.get(habit.id) ?? null,
          consecutiveCount: getConsecutiveCount(habitLogs),
          periodProgress: getPeriodProgress(schedule, habitLogs, weekStart, monthStart, today),
        };
      });

      const scheduleOk = (h: Habit) => protocolAppliesOnDate(parseSchedule(h.schedule), today);
      const protocols = allProtocols.filter(scheduleOk);

      const byTier: Record<AnchorType, ProtocolWithLog[]> = {
        [AnchorType.NON_NEGOTIABLE]: [],
        [AnchorType.GROWTH]: [],
        [AnchorType.ROTATING_FOCUS]: [],
      };

      protocols.forEach((p) => {
        byTier[p.anchor_type as AnchorType].push(p);
      });

      const doneCount = protocols.filter(
        (p) => p.todayLog && (p.todayLog.status === LogStatus.DONE || p.todayLog.status === LogStatus.PARTIAL)
      ).length;
      const todayRatio = protocols.length > 0 ? doneCount / protocols.length : 0;

      return { protocols, byTier, todayRatio };
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, currentStatus }: { habitId: string; currentStatus: LogStatus | null }) => {
      const nextStatus = currentStatus === LogStatus.DONE ? LogStatus.MISSED : LogStatus.DONE;

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: userId!, date: today, status: nextStatus },
          { onConflict: 'habit_id,date' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols', userId] });
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', userId] });
    },
  });

  const createProtocolMutation = useMutation({
    mutationFn: async (protocol: {
      title: string;
      anchor_type: string;
      type: string;
      intent?: 'BUILD' | 'QUIT';
      target_value?: number;
      target_unit?: string;
      schedule?: { frequency: string; days?: number[]; count?: number };
    }) => {
      const { schedule, ...rest } = protocol;
      const row = {
        ...rest,
        user_id: userId!,
        intent: protocol.intent ?? 'BUILD',
        target_value: protocol.target_value ?? 1,
        target_unit: protocol.target_unit ?? 'count',
        schedule: schedule ?? { frequency: 'daily' },
      };
      const { data, error } = await supabase
        .from('habits')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols', userId] });
    },
  });

  const updateProtocolMutation = useMutation({
    mutationFn: async ({
      habitId,
      updates,
    }: {
      habitId: string;
      updates: {
        title?: string;
        anchor_type?: string;
        type?: string;
        intent?: 'BUILD' | 'QUIT';
        target_value?: number;
        target_unit?: string;
        schedule?: { frequency: string; days?: number[]; count?: number };
      };
    }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .eq('user_id', userId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols', userId] });
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
    },
  });

  return {
    ...query,
    toggleExecution: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    createProtocol: createProtocolMutation.mutateAsync,
    isCreating: createProtocolMutation.isPending,
    updateProtocol: updateProtocolMutation.mutateAsync,
    isUpdating: updateProtocolMutation.isPending,
  };
}
