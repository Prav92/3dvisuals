import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Boxes, { type Box } from './Boxes';
import { getMotionState, MAX_WORKERS } from '@/lib/simulation';
import { useWarehouseStore } from '@/store/useWarehouseStore';

const worker: Box[] = [
  { position: [0, 0.35, 0], scale: [0.3, 0.7, 0.3], color: '#253d51' },
  { position: [0, 0.9, 0], scale: [0.45, 0.5, 0.4], color: '#f4a644' },
  { position: [0, 1.3, 0], scale: [0.28, 0.28, 0.28], color: '#f3c8a1' },
  { position: [0, 1.48, 0], scale: [0.36, 0.12, 0.36], color: '#f6ce64' },
];

const forklifts: Box[] = [];
for (let i = 0; i < 2; i++) {
  const x = 17, z = -7 + i * 4;
  forklifts.push(
    { position: [x, 0.6, z], scale: [1.35, 0.7, 1.9], color: '#e6b449' },
    { position: [x, 1.3, z], scale: [0.9, 0.8, 0.8], color: '#213d4a' }
  );
  for (const dx of [-0.6, 0.6]) {
    forklifts.push(
      { position: [x + dx, 1.1, z - 1], scale: [0.15, 2.2, 0.15], color: '#a0acb2' },
      { position: [x + dx, 0.2, z - 1.5], scale: [0.15, 0.15, 1], color: '#8da2af' }
    );
  }
}

function Worker({ id }: { id: number }) {
  const ref = useRef<Group>(null);
  const progress = useRef(id / 12);
  useFrame((_, delta) => {
    const state = useWarehouseStore.getState();
    const eff = state.effectiveEfficiency;
    const isVisible = id < state.workerCount;
    if (ref.current) ref.current.visible = isVisible;
    if (!isVisible) return;

    const phase = getMotionState(progress.current, eff, id);
    if (!state.paused && phase !== 'queuing') {
      progress.current = (progress.current + Math.min(delta, 0.1) * state.timeSpeed * (eff / 100) * (phase === 'transit' ? 0.04 : 0.008)) % 1;
    }
    if (ref.current) {
      if (id < 12) {
        ref.current.position.set(-16 + id * 2.8, 0, 11.1 + Math.sin(progress.current * Math.PI * 2) * 0.6);
      } else {
        const extraId = id - 12;
        ref.current.position.set(-14 + extraId * 3.5, 0, 14.2 + Math.cos(progress.current * Math.PI * 2) * 0.4);
      }
      ref.current.rotation.y = Math.cos(progress.current * Math.PI * 2) > 0 ? 0 : Math.PI;
    }
  });
  return <group ref={ref}><Boxes boxes={worker} /></group>;
}

export default function FloorCrew() {
  return (
    <group>
      <Boxes boxes={forklifts} />
      {Array.from({ length: MAX_WORKERS }, (_, id) => (
        <Worker key={id} id={id} />
      ))}
    </group>
  );
}
