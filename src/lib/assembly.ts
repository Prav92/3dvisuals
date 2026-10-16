/** Pure simulation helpers for the automotive assembly line digital twin. All values are simulated. */

export const BASELINE_EFFICIENCY = 92;
export const MAX_ROBOTS = 16;
/** Headcount at which the line runs at its designed efficiency. */
export const OPTIMAL_WORKERS = 28;
export const MIN_WORKERS = 0;
export const MAX_WORKERS = 40;
export const BASELINE_DEFECT_RATE = 0.14;
export const HISTORY_LENGTH = 60;

export type SimSpeed = 1 | 10 | 60;
export type EfficiencyBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'HALTED';
export type StageTone = 'green' | 'amber' | 'red';

/** Visual animation multiplier per simulation speed; 60x is compressed so motion stays readable. */
export const VISUAL_SPEED: Record<SimSpeed, number> = { 1: 1, 10: 3, 60: 6 };

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type StaffingLevel = 'UNDERSTAFFED' | 'OPTIMAL' | 'OVERSTAFFED';

/**
 * Multiplier applied to the efficiency target for a given headcount. Below optimal staffing output falls
 * off steeply; above it, crowding yields diminishing returns and finally a penalty (floored at 0.8).
 */
export function staffingFactor(workers: number): number {
  const ratio = Math.max(0, workers) / OPTIMAL_WORKERS;
  return ratio <= 1 ? Math.pow(ratio, 0.8) : Math.max(0.8, 1 - (ratio - 1) * 0.5);
}

/** Efficiency score (0-100) produced by the target setting and the current headcount. */
export function efficiencyScore(target: number, workers: number): number {
  return clamp(Math.round(target * staffingFactor(workers)), 0, 100);
}

export function staffingLevel(workers: number): StaffingLevel {
  if (workers < OPTIMAL_WORKERS * 0.9) return 'UNDERSTAFFED';
  if (workers > OPTIMAL_WORKERS * 1.1) return 'OVERSTAFFED';
  return 'OPTIMAL';
}

export function efficiencyBand(efficiency: number): EfficiencyBand {
  if (efficiency <= 0) return 'HALTED';
  if (efficiency >= 80) return 'HIGH';
  if (efficiency >= 50) return 'MEDIUM';
  return 'LOW';
}

export function assemblyTelemetry(efficiency: number, seconds: number, workers: number = OPTIMAL_WORKERS) {
  const throughput = clamp(efficiency + Math.sin(seconds / 7) * 1.2 * (efficiency / 100), 0, 100);
  // Defects dip slightly when running slower than baseline and climb when pushed beyond it.
  const defectRate = efficiency <= 0 ? 0 : BASELINE_DEFECT_RATE + Math.max(0, efficiency - 96) * 0.05 + Math.max(0, 70 - efficiency) * 0.004;
  return {
    throughput,
    defectRate,
    activeRobots: Math.min(MAX_ROBOTS, Math.round((MAX_ROBOTS * efficiency) / BASELINE_EFFICIENCY)),
    activeWorkers: Math.round(clamp(workers, MIN_WORKERS, MAX_WORKERS)),
    unitsPerHour: Math.round((48 * throughput) / BASELINE_EFFICIENCY),
  };
}

export type AssemblyMetrics = ReturnType<typeof assemblyTelemetry>;

export interface StageStatus { id: number; name: string; status: string; tone: StageTone }

export function stageStatuses(efficiency: number): StageStatus[] {
  const halted = efficiency <= 0;
  const healthy = efficiency >= 80;
  const degraded = efficiency < 50;
  const pick = (good: string, reduced: string, bad: string): { status: string; tone: StageTone } =>
    halted ? { status: 'Halted', tone: 'red' } : healthy ? { status: good, tone: 'green' } : degraded ? { status: bad, tone: 'red' } : { status: reduced, tone: 'amber' };
  return [
    { id: 1, name: 'Chassis', ...pick('Normal', 'Slowed', 'Starved') },
    { id: 2, name: 'Robotics', ...pick('Optimal', 'Throttled', 'Degraded') },
    { id: 3, name: 'Paint & Coat', ...pick('Normal', 'Slowed', 'Starved') },
    { id: 4, name: 'Final Assembly', ...pick('Normal', 'Slowed', 'Starved') },
    { id: 5, name: 'Quality Control', ...pick('Active', 'Backlog', 'Backlog') },
  ];
}
