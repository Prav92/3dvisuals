import { create } from 'zustand';
import {
  assemblyTelemetry,
  BASELINE_EFFICIENCY,
  clamp,
  efficiencyScore,
  HISTORY_LENGTH,
  MAX_WORKERS,
  MIN_WORKERS,
  OPTIMAL_WORKERS,
  type AssemblyMetrics,
  type SimSpeed,
} from '@/lib/assembly';

export interface HistoryPoint { time: number; throughput: number; defectRate: number }

interface AssemblyState {
  /** Slider value: the efficiency the plant is aiming for. */
  efficiencyRate: number;
  workerCount: number;
  /** Efficiency score actually achieved: the target scaled by staffing. Drives telemetry and animation. */
  effectiveEfficiency: number;
  timeSpeed: SimSpeed;
  paused: boolean;
  simulationSeconds: number;
  metrics: AssemblyMetrics;
  history: HistoryPoint[];
  setEfficiency: (value: number) => void;
  setWorkers: (value: number) => void;
  addWorker: () => void;
  removeWorker: () => void;
  setSpeed: (speed: SimSpeed) => void;
  togglePause: () => void;
  tick: (delta: number) => void;
}

const initialScore = efficiencyScore(BASELINE_EFFICIENCY, OPTIMAL_WORKERS);
const initialMetrics = assemblyTelemetry(initialScore, 0, OPTIMAL_WORKERS);

/** Recomputes everything derived from the target and headcount. */
function derive(target: number, workers: number, seconds: number) {
  const effectiveEfficiency = efficiencyScore(target, workers);
  return { effectiveEfficiency, metrics: assemblyTelemetry(effectiveEfficiency, seconds, workers) };
}

export const useAssemblyStore = create<AssemblyState>((set) => ({
  efficiencyRate: BASELINE_EFFICIENCY,
  workerCount: OPTIMAL_WORKERS,
  effectiveEfficiency: initialScore,
  timeSpeed: 1,
  paused: false,
  simulationSeconds: 0,
  metrics: initialMetrics,
  history: [{ time: 0, throughput: initialMetrics.throughput, defectRate: initialMetrics.defectRate }],
  setEfficiency: (value) =>
    set((s) => {
      const efficiencyRate = Math.round(clamp(value, 0, 100));
      return { efficiencyRate, ...derive(efficiencyRate, s.workerCount, s.simulationSeconds) };
    }),
  setWorkers: (value) =>
    set((s) => {
      const workerCount = Math.round(clamp(value, MIN_WORKERS, MAX_WORKERS));
      return { workerCount, ...derive(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  addWorker: () =>
    set((s) => {
      const workerCount = Math.min(MAX_WORKERS, s.workerCount + 1);
      return { workerCount, ...derive(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  removeWorker: () =>
    set((s) => {
      const workerCount = Math.max(MIN_WORKERS, s.workerCount - 1);
      return { workerCount, ...derive(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  setSpeed: (timeSpeed) => set({ timeSpeed }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  tick: (delta) =>
    set((s) => {
      if (s.paused) return s;
      const simulationSeconds = s.simulationSeconds + delta * s.timeSpeed;
      const metrics = assemblyTelemetry(s.effectiveEfficiency, simulationSeconds, s.workerCount);
      return {
        simulationSeconds,
        metrics,
        history: [...s.history.slice(-(HISTORY_LENGTH - 1)), { time: simulationSeconds, throughput: metrics.throughput, defectRate: metrics.defectRate }],
      };
    }),
}));
