import { LogStatus, LOG_STATUS_VALUES, MOMENTUM_ALPHA, MOMENTUM_WINDOW } from './constants';

export interface DayLog {
  date: string;
  status: LogStatus;
}

/**
 * Exponential decay weighted average over MOMENTUM_WINDOW days.
 * Only NON_NEGOTIABLE protocols feed this score.
 * Most recent day has highest weight.
 */
export function computeMomentumScore(logs: DayLog[]): number {
  if (logs.length === 0) return 0;

  // Sort descending so index 0 = most recent
  const sorted = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MOMENTUM_WINDOW);

  let weightedSum = 0;
  let totalWeight = 0;

  sorted.forEach((log, i) => {
    const weight = MOMENTUM_ALPHA * Math.pow(1 - MOMENTUM_ALPHA, i);
    const value = LOG_STATUS_VALUES[log.status] ?? 0;
    weightedSum += weight * value;
    totalWeight += weight;
  });

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}

/**
 * 30-day consistency rate for NON_NEGOTIABLE protocols.
 * (DONE + 0.5 × PARTIAL) / expected_total × 100
 */
export function computeConsistencyRate(logs: DayLog[], periodDays = 30): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, periodDays);

  let earned = 0;
  const expected = sorted.length;

  sorted.forEach((log) => {
    if (log.status === LogStatus.DONE) earned += 1;
    else if (log.status === LogStatus.PARTIAL) earned += 0.5;
  });

  return Math.round((earned / expected) * 100);
}

/**
 * Weekly execution rate for a set of logs (7 days).
 */
export function computeWeeklyRate(logs: DayLog[]): number {
  return computeConsistencyRate(logs, 7);
}

/**
 * Count consecutive DONE or PARTIAL logs from the most recent day.
 */
export function getConsecutiveCount(logs: DayLog[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let count = 0;

  for (const log of sorted) {
    if (log.status === LogStatus.DONE || log.status === LogStatus.PARTIAL) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Hash-based mock for per-protocol health (used in metrics dashboard until real aggregation).
 */
export function mockProtocolHealth(protocolId: string): number {
  let hash = 0;
  for (let i = 0; i < protocolId.length; i++) {
    hash = (hash * 31 + protocolId.charCodeAt(i)) % 100;
  }
  return 40 + (hash % 60); // Returns 40–99
}
