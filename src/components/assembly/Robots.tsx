'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { BufferAttribute, BufferGeometry, Color, PointsMaterial, type Group } from 'three';
import { Part, type V3 } from './parts';
import { line, ROBOT_X, ROBOT_Z } from './layout';
import { useAssemblyStore } from '@/store/useAssemblyStore';
import { VISUAL_SPEED } from '@/lib/assembly';

const ORANGE = '#f97316';
const SPARK_COUNT = 40;

/** Pooled weld-spark particles. Positions live in a typed array mutated per frame (no React state). */
function Sparks({ origin }: { origin: V3 }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(SPARK_COUNT * 3).fill(-100), 3));
    return g;
  }, []);
  const material = useMemo(() => new PointsMaterial({ size: 4, sizeAttenuation: false, color: new Color(4, 2.4, 0.8), toneMapped: false }), []);
  const data = useRef({ vel: new Float32Array(SPARK_COUNT * 3), life: new Float32Array(SPARK_COUNT) });

  useFrame((_, delta) => {
    const s = useAssemblyStore.getState();
    const active = !s.paused && s.effectiveEfficiency > 0;
    const dt = active ? Math.min(delta, 0.1) * VISUAL_SPEED[s.timeSpeed] : 0;
    if (dt === 0) return;
    const { vel, life } = data.current;
    const pos = geometry.attributes.position.array as Float32Array;
    let budget = Math.ceil(dt * 70 * (s.effectiveEfficiency / 100));
    for (let i = 0; i < SPARK_COUNT; i++) {
      const k = i * 3;
      if (life[i] <= 0) {
        if (budget > 0 && Math.random() < 0.9) {
          budget--;
          life[i] = 0.25 + Math.random() * 0.35;
          pos[k] = origin[0]; pos[k + 1] = origin[1]; pos[k + 2] = origin[2];
          vel[k] = (Math.random() - 0.5) * 3; vel[k + 1] = 1.5 + Math.random() * 2.5; vel[k + 2] = 0.4 + Math.random() * 2;
        } else {
          pos[k + 1] = -100;
        }
        continue;
      }
      life[i] -= dt;
      vel[k + 1] -= 9.8 * dt;
      pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
      if (life[i] <= 0) pos[k + 1] = -100;
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

function RobotArm({ x, phase }: { x: number; phase: number }) {
  const turret = useRef<Group>(null);
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  useFrame(() => {
    const w = line.work;
    if (turret.current) turret.current.rotation.y = Math.sin(w * 1.3 + phase) * 0.12;
    if (shoulder.current) shoulder.current.rotation.x = 0.6 + Math.sin(w * 1.9 + phase) * 0.07;
    if (elbow.current) elbow.current.rotation.x = 0.4 + Math.sin(w * 2.6 + phase) * 0.06;
  });
  return (
    <group position={[x, 0, ROBOT_Z]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.4, 24]} />
        <meshStandardMaterial color="#2b3138" />
      </mesh>
      <group ref={turret} position-y={0.4}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.6, 20]} />
          <meshStandardMaterial color={ORANGE} />
        </mesh>
        <group ref={shoulder} position={[0, 0.55, 0]}>
          <Part p={[0, 1, 0]} s={[0.4, 2, 0.4]} c={ORANGE} />
          <group ref={elbow} position={[0, 2, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.32, 16, 12]} />
              <meshStandardMaterial color="#2b3138" />
            </mesh>
            <Part p={[0, 0, 0.9]} s={[0.32, 0.32, 1.8]} c={ORANGE} />
            <Part p={[0, -0.2, 1.8]} s={[0.14, 0.4, 0.14]} c="#2b3138" />
            <Part p={[0, -0.45, 1.8]} s={[0.1, 0.1, 0.1]} c="#ffd27a" glow />
          </group>
        </group>
      </group>
      <Sparks origin={[x, 0.85, -1]} />
    </group>
  );
}

function StationTag() {
  const pct = useAssemblyStore((s) => Math.round(s.metrics.throughput));
  return <span className="asm-tag">ROBO-ARM STATION B ({pct}%)</span>;
}

export default function Robots() {
  return (
    <group>
      {ROBOT_X.map((x, i) => (
        <RobotArm key={x} x={x} phase={i * 1.7} />
      ))}
      <Html position={[ROBOT_X[1], 4.9, ROBOT_Z]} center zIndexRange={[10, 0]}>
        <StationTag />
      </Html>
    </group>
  );
}
