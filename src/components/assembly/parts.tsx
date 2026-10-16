export type V3 = [number, number, number];

/** Small box primitive shared by all procedural assembly props. `glow` renders an HDR emissive surface for bloom. */
export function Part({ p = [0, 0, 0], s, c, glow = false, r }: { p?: V3; s: V3; c: string; glow?: boolean; r?: V3 }) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      {glow ? (
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2.5} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={c} roughness={0.7} metalness={0.1} />
      )}
    </mesh>
  );
}
