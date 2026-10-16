import { create } from 'zustand';
import {
  telemetry,
  efficiencyScore,
  OPTIMAL_WORKERS,
  MIN_WORKERS,
  MAX_WORKERS,
  BASELINE_EFFICIENCY,
} from '@/lib/simulation';

export type StationId = 'dock' | 'sort' | 'rack';

interface WarehouseState {
  efficiencyRate: number;
  workerCount: number;
  effectiveEfficiency: number;
  timeSpeed: 1 | 10 | 60;
  paused: boolean;
  activeStationId: StationId | null;
  selectedBay: number;
  simulationSeconds: number;
  systemAlerts: string[];
  metrics: ReturnType<typeof telemetry>;
  history: { time: number; throughput: number }[];
  cameraCommand: { type: 'in' | 'out' | 'reset'; serial: number };
  setEfficiency: (value: number) => void;
  setWorkers: (value: number) => void;
  addWorker: () => void;
  removeWorker: () => void;
  setSpeed: (speed: 1 | 10 | 60) => void;
  togglePause: () => void;
  selectStation: (id: StationId) => void;
  selectBay: (bay: number) => void;
  camera: (type: 'in' | 'out' | 'reset') => void;
  tick: (delta: number) => void;
}

function deriveWarehouse(target: number, workers: number, seconds: number) {
  const effectiveEfficiency = efficiencyScore(target, workers);
  const alerts: string[] = [];
  if (effectiveEfficiency < 60) {
    alerts.push('Queue at junction B', 'Dispatch capacity reduced');
  }
  if (workers < OPTIMAL_WORKERS * 0.75) {
    alerts.push('Floor 01 understaffed');
  }
  return {
    effectiveEfficiency,
    metrics: telemetry(effectiveEfficiency, seconds, workers),
    systemAlerts: alerts,
  };
}

const initialScore = efficiencyScore(BASELINE_EFFICIENCY, OPTIMAL_WORKERS);

export const useWarehouseStore = create<WarehouseState>((set) => ({
  efficiencyRate: BASELINE_EFFICIENCY,
  workerCount: OPTIMAL_WORKERS,
  effectiveEfficiency: initialScore,
  timeSpeed: 1,
  paused: false,
  activeStationId: null,
  selectedBay: 1,
  simulationSeconds: 0,
  systemAlerts: [],
  metrics: telemetry(initialScore, 0, OPTIMAL_WORKERS),
  history: [{ time: 0, throughput: initialScore }],
  cameraCommand: { type: 'reset', serial: 0 },
  setEfficiency: (value) =>
    set((s) => {
      const efficiencyRate = Math.max(0, Math.min(100, value));
      return { efficiencyRate, ...deriveWarehouse(efficiencyRate, s.workerCount, s.simulationSeconds) };
    }),
  setWorkers: (value) =>
    set((s) => {
      const workerCount = Math.max(MIN_WORKERS, Math.min(MAX_WORKERS, Math.round(value)));
      return { workerCount, ...deriveWarehouse(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  addWorker: () =>
    set((s) => {
      const workerCount = Math.min(MAX_WORKERS, s.workerCount + 1);
      return { workerCount, ...deriveWarehouse(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  removeWorker: () =>
    set((s) => {
      const workerCount = Math.max(MIN_WORKERS, s.workerCount - 1);
      return { workerCount, ...deriveWarehouse(s.efficiencyRate, workerCount, s.simulationSeconds) };
    }),
  setSpeed: (timeSpeed) => set({ timeSpeed }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  selectStation: (activeStationId) => set({ activeStationId }),
  selectBay: (selectedBay) => set({ selectedBay, activeStationId: 'dock' }),
  camera: (type) =>
    set((s) => ({
      activeStationId: type === 'reset' ? null : s.activeStationId,
      cameraCommand: { type, serial: s.cameraCommand.serial + 1 },
    })),
  tick: (delta) =>
    set((s) => {
      if (s.paused) return s;
      const simulationSeconds = s.simulationSeconds + delta * s.timeSpeed;
      const metrics = telemetry(s.effectiveEfficiency, simulationSeconds, s.workerCount);
      return {
        simulationSeconds,
        metrics,
        history: [...s.history.slice(-59), { time: simulationSeconds, throughput: metrics.throughput }],
      };
    }),
}));
