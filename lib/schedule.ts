/**
 * Protocol schedule types and helpers.
 * habits.schedule JSONB uses these shapes.
 */

export type Schedule =
  | { frequency: 'daily' }
  | { frequency: 'weekly'; days: number[] }
  | { frequency: 'days_per_week'; count: number }
  | { frequency: 'monthly'; days: number[] }
  | { frequency: 'days_per_month'; count: number };

export const DAILY_SCHEDULE: Schedule = { frequency: 'daily' };

/** Normalize unknown JSON to Schedule; default to daily. */
export function parseSchedule(raw: unknown): Schedule {
  if (raw && typeof raw === 'object' && 'frequency' in raw) {
    const o = raw as Record<string, unknown>;
    const freq = o.frequency;
    if (freq === 'daily') return { frequency: 'daily' };
    if (freq === 'weekly' && Array.isArray(o.days)) {
      return { frequency: 'weekly', days: o.days.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6) };
    }
    if (freq === 'days_per_week' && typeof o.count === 'number' && o.count >= 0 && o.count <= 7) {
      return { frequency: 'days_per_week', count: Math.round(o.count) };
    }
    if (freq === 'monthly' && Array.isArray(o.days)) {
      return { frequency: 'monthly', days: o.days.filter((d): d is number => typeof d === 'number' && d >= 1 && d <= 31) };
    }
    if (freq === 'days_per_month' && typeof o.count === 'number' && o.count >= 0 && o.count <= 7) {
      return { frequency: 'days_per_month', count: Math.round(o.count) };
    }
  }
  return DAILY_SCHEDULE;
}

/**
 * Returns whether a protocol with this schedule applies on the given date (yyyy-MM-dd).
 * Used to filter protocols for STATUS, calendar, and metrics.
 */
export function protocolAppliesOnDate(schedule: Schedule, dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00Z');
  const weekday = d.getUTCDay();
  const dayOfMonth = d.getUTCDate();

  switch (schedule.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return schedule.days.includes(weekday);
    case 'days_per_week':
      return true;
    case 'monthly':
      return schedule.days.includes(dayOfMonth);
    case 'days_per_month':
      return true;
    default:
      return true;
  }
}
