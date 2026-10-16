import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
export type Box = { position: [number, number, number]; scale: [number, number, number]; color: string };
export default function Boxes({ boxes }: { boxes: Box[] }) {
 const ref = useRef<InstancedMesh>(null);
 useLayoutEffect(() => { if (!ref.current) return; const object = new Object3D(); boxes.forEach((box, i) => { object.position.set(...box.position); object.scale.set(...box.scale); object.updateMatrix(); ref.current!.setMatrixAt(i, object.matrix); ref.current!.setColorAt(i, new Color(box.color)); }); ref.current.instanceMatrix.needsUpdate = true; if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true; ref.current.computeBoundingSphere(); }, [boxes]);
 return <instancedMesh ref={ref} args={[undefined, undefined, boxes.length]} castShadow receiveShadow><boxGeometry /><meshStandardMaterial roughness={0.7} /></instancedMesh>;
}
