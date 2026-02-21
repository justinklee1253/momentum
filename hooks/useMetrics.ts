import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { LogStatus, AnchorType } from '../lib/constants';
import { computeMomentumScore, computeConsistencyRate, mockProtocolHealth, DayLog } from '../lib/formulas';
import { parseSchedule, protocolAppliesOnDate } from '../lib/schedule';

export interface MetricsData {
  momentumScore: number;
  consistencyRate: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendDelta: number;
  label: string;
  history: Array<{ date: string; score: number }>;
  protocolHealth: Record<string, number>;
}

export function useMetrics(userId: string | null) {
  return useQuery<MetricsData>({
    queryKey: ['metrics', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const [logsRes, habitsRes, snapshotsRes] = await Promise.all([
        supabase
          .from('habit_logs')
          .select('*, habits!inner(anchor_type, schedule)')
          .eq('user_id', userId!)
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: false }),
        supabase
          .from('habits')
          .select('id, anchor_type')
          .eq('user_id', userId!)
          .eq('active', true),
        supabase
          .from('metrics_snapshots')
          .select('date, momentum_score')
          .eq('user_id', userId!)
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: true }),
      ]);

      const allLogs = logsRes.data ?? [];
      const habits = habitsRes.data ?? [];

      const nonNegLogs: DayLog[] = allLogs
        .filter(
          (l: any) =>
            l.habits?.anchor_type === AnchorType.NON_NEGOTIABLE &&
            protocolAppliesOnDate(parseSchedule(l.habits?.schedule), l.date)
        )
        .map((l: any) => ({ date: l.date, status: l.status as LogStatus }));

      const momentumScore = computeMomentumScore(nonNegLogs);
      const consistencyRate = computeConsistencyRate(nonNegLogs);

      // Trend: compare last 7 days vs previous 7 days
      const last7 = nonNegLogs.filter((l) => l.date >= format(subDays(new Date(), 7), 'yyyy-MM-dd'));
      const prev7 = nonNegLogs.filter(
        (l) =>
          l.date >= format(subDays(new Date(), 14), 'yyyy-MM-dd') &&
          l.date < format(subDays(new Date(), 7), 'yyyy-MM-dd')
      );
      const last7Score = computeMomentumScore(last7);
      const prev7Score = computeMomentumScore(prev7);
      const trendDelta = last7Score - prev7Score;
      const trendDirection = trendDelta > 2 ? 'up' : trendDelta < -2 ? 'down' : 'stable';

      // Build history from snapshots or compute for last 30 days
      const history = (snapshotsRes.data ?? []).map((s) => ({
        date: s.date,
        score: s.momentum_score,
      }));

      // Per-protocol health (hash-based mock until real aggregation)
      const protocolHealth: Record<string, number> = {};
      habits.forEach((h) => {
        protocolHealth[h.id] = mockProtocolHealth(h.id);
      });

      const getLabelFromScore = (s: number) => {
        if (s >= 80) return 'LOCKED IN';
        if (s >= 60) return 'BUILDING';
        if (s >= 40) return 'DRIFTING';
        return 'OFF TRACK';
      };

      return {
        momentumScore,
        consistencyRate,
        trendDirection,
        trendDelta,
        label: getLabelFromScore(momentumScore),
        history,
        protocolHealth,
      };
    },
  });
}
