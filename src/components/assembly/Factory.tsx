'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { Part } from './parts';
import { advanceLine, BELT_LENGTH, BELT_START, BELT_Y, CAR_COUNT, line, PLATFORM, QC_X } from './layout';

const BODY_COLORS = ['#e5484d', '#3b82f6', '#e8eaed', '#f5a524'];

function Platform() {
  const { width, depth, wallHeight } = PLATFORM;
  return (
    <group>
      <gridHelper args={[140, 70, '#1f3a5a', '#152a42']} position={[0, -0.45, 0]} />
      <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.4, depth]} />
        <meshStandardMaterial color="#cdd5dc" roughness={0.9} />
      </mesh>
      <Part p={[0, wallHeight / 2, -depth / 2 - 0.2]} s={[width + 0.8, wallHeight, 0.4]} c="#aab4bd" />
      <Part p={[-width / 2 - 0.2, wallHeight / 2, 0]} s={[0.4, wallHeight, depth]} c="#b7c0c8" />
      {[-16, -8, 0, 8, 16].map((x) => (
        <Part key={`col-${x}`} p={[x, (wallHeight + 0.4) / 2, -depth / 2 + 0.2]} s={[0.8, wallHeight + 0.4, 0.8]} c="#5f6b77" />
      ))}
      {[-12, -4, 4, 12].map((x) => (
        <Part key={`win-${x}`} p={[x, 3, -depth / 2 + 0.03]} s={[5.6, 2, 0.06]} c="#27343f" />
      ))}
      {[-8, 0, 8].map((z) => (
        <Part key={`colw-${z}`} p={[-width / 2 + 0.2, (wallHeight + 0.4) / 2, z]} s={[0.8, wallHeight + 0.4, 0.8]} c="#5f6b77" />
      ))}
      {[-4, 4].map((z) => (
        <Part key={`winw-${z}`} p={[-width / 2 + 0.03, 3, z]} s={[0.06, 2, 5.6]} c="#27343f" />
      ))}
      <Part p={[0, 0.011, 2.3]} s={[36, 0.02, 0.18]} c="#f5c518" />
      <Part p={[0, 0.011, -2.3]} s={[36, 0.02, 0.18]} c="#f5c518" />
    </group>
  );
}

function Conveyor() {
  const slats = useRef<Group>(null);
  useFrame((_, delta) => {
    advanceLine(delta);
    if (slats.current) slats.current.position.x = (line.phase * BELT_LENGTH) % 2;
  });
  return (
    <group>
      <Part p={[0, 0.17, 0]} s={[BELT_LENGTH, 0.3, 2.6]} c="#3a4047" />
      <Part p={[0, 0.4, 0]} s={[BELT_LENGTH, 0.3, 3]} c="#14171b" />
      <group ref={slats} position-y={BELT_Y - 0.01}>
        {Array.from({ length: BELT_LENGTH / 2 }, (_, k) => (
          <Part key={k} p={[BELT_START + 1 + k * 2, 0, 0]} s={[0.12, 0.02, 2.7]} c="#2e343b" />
        ))}
      </group>
      <Part p={[0, 0.6, 1.6]} s={[BELT_LENGTH, 0.2, 0.18]} c="#f5c518" />
      <Part p={[0, 0.6, -1.6]} s={[BELT_LENGTH, 0.2, 0.18]} c="#f5c518" />
    </group>
  );
}

/** Car shells appear progressively as they pass welding (x > -6) and trim (x > 2) stages. */
function Cars() {
  const refs = useRef<(Group | null)[]>([]);
  useFrame(() => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const x = BELT_START + ((line.phase + i / CAR_COUNT) % 1) * BELT_LENGTH;
      g.position.x = x;
      g.children[1].visible = x > -6;
      g.children[2].visible = x > 2;
    });
  });
  return (
    <group position-y={BELT_Y}>
      {Array.from({ length: CAR_COUNT }, (_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <Part p={[0, 0.3, 0]} s={[4, 0.3, 1.8]} c="#7d8a96" />
          <Part p={[0, 0.72, 0]} s={[3.8, 0.55, 1.7]} c={BODY_COLORS[i % BODY_COLORS.length]} />
          <Part p={[-0.1, 1.22, 0]} s={[2, 0.45, 1.5]} c="#bcd9ea" />
        </group>
      ))}
    </group>
  );
}

function QcArch({ x }: { x: number }) {
  const laser = useRef<Mesh>(null);
  useFrame(() => {
    if (laser.current) laser.current.position.y = 1.9 + Math.sin(line.phase * 50 * Math.PI * 2 + x) * 0.9;
  });
  return (
    <group position={[x, 0, 0]}>
      <Part p={[0, 1.6, 2.4]} s={[0.25, 3.2, 0.25]} c="#f2f5f7" />
      <Part p={[0, 1.6, -2.4]} s={[0.25, 3.2, 0.25]} c="#f2f5f7" />
      <Part p={[0, 3.3, 0]} s={[0.35, 0.3, 5.1]} c="#f2f5f7" />
      <Part p={[0, 3.3, 0]} s={[0.4, 0.06, 4]} c="#34f5a0" glow />
      <mesh ref={laser}>
        <boxGeometry args={[0.04, 0.04, 4.6]} />
        <meshStandardMaterial color="#34f5a0" emissive="#34f5a0" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Factory() {
  return (
    <group>
      <Platform />
      <Conveyor />
      <Cars />
      {QC_X.map((x) => (
        <QcArch key={x} x={x} />
      ))}
    </group>
  );
}
