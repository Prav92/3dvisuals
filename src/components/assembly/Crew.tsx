'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Part } from './parts';
import { line, motionScale } from './layout';
import { clamp, MAX_WORKERS } from '@/lib/assembly';
import { useAssemblyStore } from '@/store/useAssemblyStore';

const STATION_X = [-16, -12, -8, -4, 0, 4, 8, 12];
const PATROLLERS = 4;
/** Total figures that can appear on the floor (desk workers first, then patrollers). */
export const FLOOR_FIGURES = STATION_X.length + PATROLLERS;

/** How many floor figures represent the current headcount; any positive headcount shows at least one. */
export function visibleFigures(workerCount: number): number {
  return workerCount <= 0 ? 0 : clamp(Math.ceil((workerCount * FLOOR_FIGURES) / MAX_WORKERS), 1, FLOOR_FIGURES);
}

/** Triangle-wave helper: returns 0..1 position and travel direction for a 0..1 looping progress value. */
function pingPong(u: number) {
  const m = ((u % 1) * 2) % 2;
  const forward = m < 1;
  return { t: forward ? m : 2 - m, forward };
}

function Figure({ vest = '#c6f432' }: { vest?: string }) {
  return (
    <group>
      <Part p={[0, 0.35, 0]} s={[0.36, 0.7, 0.3]} c="#1e293b" />
      <Part p={[0, 1.02, 0]} s={[0.6, 0.65, 0.38]} c={vest} />
      <Part p={[0, 1.05, 0]} s={[0.62, 0.08, 0.4]} c="#e5e7eb" />
      <Part p={[-0.38, 1.0, 0]} s={[0.14, 0.5, 0.14]} c={vest} />
      <Part p={[0.38, 1.0, 0]} s={[0.14, 0.5, 0.14]} c={vest} />
      <Part p={[0, 1.5, 0]} s={[0.3, 0.3, 0.3]} c="#f1c27d" />
      <Part p={[0, 1.68, 0]} s={[0.38, 0.16, 0.38]} c="#facc15" />
    </group>
  );
}

function StationWorker({ index, x }: { index: number; x: number }) {
  const worker = useRef<Group>(null);
  const screen = useRef<Group>(null);
  useFrame(() => {
    const present = index < visibleFigures(useAssemblyStore.getState().workerCount);
    if (worker.current) {
      worker.current.visible = present;
      worker.current.position.y = Math.abs(Math.sin(line.work * 2 + index * 1.3)) * 0.04;
    }
    if (screen.current) screen.current.visible = present;
  });
  return (
    <group>
      <group ref={worker} position={[x, 0, 6.2]}>
        <Figure />
      </group>
      <Part p={[x, 0.4, 7.3]} s={[2.2, 0.8, 1]} c="#8e9ba7" />
      <Part p={[x, 0.82, 7.3]} s={[0.5, 0.04, 0.35]} c="#d7dde2" />
      <group ref={screen}>
        <Part p={[x, 1.1, 7.2]} s={[0.9, 0.55, 0.08]} c="#38bdf8" glow />
      </group>
    </group>
  );
}

function Patroller({ index, slot }: { index: number; slot: number }) {
  const ref = useRef<Group>(null);
  const progress = useRef(slot / PATROLLERS);
  useFrame((_, delta) => {
    progress.current += motionScale(delta) * 0.03;
    if (!ref.current) return;
    ref.current.visible = index < visibleFigures(useAssemblyStore.getState().workerCount);
    const { t, forward } = pingPong(progress.current);
    ref.current.position.set(-14 + 28 * t, Math.abs(Math.sin(line.work * 8)) * 0.06, 3.9 + (slot % 2) * 0.8);
    ref.current.rotation.y = forward ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <Figure vest="#ffb020" />
    </group>
  );
}

function AgvCart({ z, offset }: { z: number; offset: number }) {
  const ref = useRef<Group>(null);
  const progress = useRef(offset);
  useFrame((_, delta) => {
    progress.current += motionScale(delta) * 0.032;
    if (!ref.current) return;
    const { t, forward } = pingPong(progress.current);
    ref.current.position.set(-17 + 34 * t, 0.25, z);
    ref.current.rotation.y = forward ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <Part p={[0, 0, 0]} s={[1.1, 0.36, 1.7]} c="#f1f5f9" />
      <Part p={[0, 0.3, 0]} s={[0.95, 0.2, 1.3]} c="#2563eb" />
      <Part p={[0, 0.05, 0.86]} s={[0.7, 0.08, 0.04]} c="#38bdf8" glow />
      <Part p={[0, 0.62, 0]} s={[0.7, 0.45, 0.7]} c="#9a7b57" />
    </group>
  );
}

/** Asphalt road along the front edge: yellow edge lines and a white dashed centre line. */
function Road() {
  return (
    <group>
      <Part p={[0, 0.012, 10.2]} s={[38, 0.024, 3.4]} c="#3b434c" />
      <Part p={[0, 0.026, 8.6]} s={[38, 0.012, 0.16]} c="#f5c518" />
      <Part p={[0, 0.026, 11.8]} s={[38, 0.012, 0.16]} c="#f5c518" />
      {Array.from({ length: 24 }, (_, i) => (
        <Part key={i} p={[-17.25 + i * 1.5, 0.028, 10.2]} s={[0.8, 0.012, 0.12]} c="#e2e8f0" />
      ))}
    </group>
  );
}

/** Cardboard stock at the end of the line, as in the reference render. */
function Cargo() {
  return (
    <group>
      <Part p={[15.5, 0.12, -3.6]} s={[2.6, 0.24, 2.4]} c="#7c5a38" />
      <Part p={[15.1, 0.7, -3.6]} s={[1.1, 0.9, 1.1]} c="#c9a26b" />
      <Part p={[16.2, 0.55, -3.9]} s={[0.9, 0.6, 0.9]} c="#d4b07a" />
      <Part p={[15.4, 1.45, -3.5]} s={[0.8, 0.6, 0.8]} c="#c9a26b" />
      <Part p={[15.5, 0.12, 4]} s={[2.6, 0.24, 2.4]} c="#7c5a38" />
      <Part p={[15.2, 0.7, 4]} s={[1.2, 0.9, 1.2]} c="#c9a26b" />
    </group>
  );
}

export default function Crew() {
  return (
    <group>
      <Road />
      <Cargo />
      {STATION_X.map((x, i) => (
        <StationWorker key={x} index={i} x={x} />
      ))}
      {Array.from({ length: PATROLLERS }, (_, slot) => (
        <Patroller key={slot} index={STATION_X.length + slot} slot={slot} />
      ))}
      <AgvCart z={9.5} offset={0} />
      <AgvCart z={10.9} offset={0.5} />
    </group>
  );
}
