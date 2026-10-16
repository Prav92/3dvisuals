import { useAssemblyStore } from '@/store/useAssemblyStore';
import { VISUAL_SPEED } from '@/lib/assembly';

/** Shared layout constants for the factory floor (world units; X runs along the belt). */
export const BELT_START = -17;
export const BELT_LENGTH = 34;
export const BELT_Y = 0.55;
export const CAR_COUNT = 7;
export const ROBOT_X = [-9, -3, 3] as const;
export const ROBOT_Z = -3.2;
export const QC_X = [9, 13.5] as const;
export const PLATFORM = { width: 40, depth: 24, wallHeight: 5 } as const;

/**
 * Mutable animation clocks shared by all scene objects. They are advanced once per frame by
 * {@link advanceLine} and read directly inside useFrame, so animation never triggers React renders.
 */
export const line = { phase: 0, work: 0 };

export function advanceLine(delta: number) {
  const s = useAssemblyStore.getState();
  if (s.paused || s.effectiveEfficiency <= 0) return;
  const step = Math.min(delta, 0.1) * VISUAL_SPEED[s.timeSpeed] * (s.effectiveEfficiency / 100);
  line.phase = (line.phase + step * 0.035) % 1;
  line.work += step;
}

/** Scalar used by AGVs / workers: 0 when stopped, otherwise visual speed × efficiency. */
export function motionScale(delta: number) {
  const s = useAssemblyStore.getState();
  if (s.paused || s.effectiveEfficiency <= 0) return 0;
  return Math.min(delta, 0.1) * VISUAL_SPEED[s.timeSpeed] * (s.effectiveEfficiency / 100);
}
