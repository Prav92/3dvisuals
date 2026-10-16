export type MotionState = 'picking' | 'transit' | 'queuing' | 'offloading';

export const OPTIMAL_WORKERS = 12;
export const MIN_WORKERS = 0;
export const MAX_WORKERS = 20;
export const BASELINE_EFFICIENCY = 94;

export type StaffingLevel = 'UNDERSTAFFED' | 'OPTIMAL' | 'OVERSTAFFED';

/**
 * Staffing ratio multiplier applied to the target efficiency score.
 * Drops steeply when understaffed; experiences diminishing returns and crowding penalty when overstaffed.
 */
export function staffingFactor(workers: number): number {
  const ratio = Math.max(0, workers) / OPTIMAL_WORKERS;
  return ratio <= 1 ? Math.pow(ratio, 0.8) : Math.max(0.8, 1 - (ratio - 1) * 0.5);
}

/** Efficiency score (0-100) produced by the target setting and the current headcount. */
export function efficiencyScore(target: number, workers: number): number {
  return Math.min(100, Math.max(0, Math.round(target * staffingFactor(workers))));
}

export function staffingLevel(workers: number): StaffingLevel {
  if (workers < OPTIMAL_WORKERS * 0.9) return 'UNDERSTAFFED';
  if (workers > OPTIMAL_WORKERS * 1.1) return 'OVERSTAFFED';
  return 'OPTIMAL';
}

export function getMotionState(progress: number, efficiency: number, id: number): MotionState {
  if (efficiency === 0 || (efficiency < 60 && id % 3 === 0)) return 'queuing';
  if (progress < 0.05) return 'picking';
  if (progress > 0.9) return 'offloading';
  return 'transit';
}

export function telemetry(efficiency: number, seconds: number, workers: number = OPTIMAL_WORKERS) {
  const throughput = Math.max(0, Math.min(100, efficiency + Math.sin(seconds / 8) * 1.5 * efficiency / 100));
  return {
    throughput,
    ordersPerHour: Math.round(3420 * throughput / 94),
    activeAGVs: Math.min(40, Math.round(38 * efficiency / 94)),
    queueCount: Math.ceil(Math.max(0, 60 - efficiency) * 1.4),
    oee: throughput * 0.98 * 0.97,
    activeWorkers: Math.round(Math.min(MAX_WORKERS, Math.max(MIN_WORKERS, workers))),
  };
}
