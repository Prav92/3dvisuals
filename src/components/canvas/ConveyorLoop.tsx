import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { InstancedMesh, Object3D } from 'three';
import Boxes, { type Box } from './Boxes';
import { conveyorPath } from './paths';
import { useWarehouseStore } from '@/store/useWarehouseStore';
const boxes: Box[] = [];
for (const z of [3.4,7.4]) { boxes.push({ position:[-0.5,0.8,z],scale:[25,0.3,1.2],color:'#dcb24e' }); for(let x=-12.5;x<12;x+=0.45) boxes.push({position:[x,1,z],scale:[0.12,0.1,1],color:'#9caeb7'}); for(let x=-12;x<12;x+=4) boxes.push({position:[x,0.4,z],scale:[0.15,0.8,1],color:'#526a79'}); }
for(const x of [-13,12]) boxes.push({position:[x,0.85,5.4],scale:[1.2,0.4,5],color:'#dcb24e'});
for(let i=0;i<5;i++) boxes.push({position:[-9+i*4.2,0.8,9],scale:[1.1,0.3,2],color:'#dcb24e'});
const dummy = new Object3D();
export default function ConveyorLoop() {
 const ref = useRef<InstancedMesh>(null); const elapsed = useRef(0);
 useFrame((_, delta) => { const s = useWarehouseStore.getState(); if (!s.paused) elapsed.current += Math.min(delta,0.1)*s.timeSpeed*s.effectiveEfficiency/100; for(let i=0;i<22;i++) { const t=(elapsed.current*0.025+i/22)%1; dummy.position.copy(conveyorPath.getPointAt(t)); dummy.rotation.y=Math.atan2(conveyorPath.getTangentAt(t).x,conveyorPath.getTangentAt(t).z); dummy.updateMatrix(); ref.current?.setMatrixAt(i,dummy.matrix); } if(ref.current) ref.current.instanceMatrix.needsUpdate=true; });
 return <group onClick={e=>{e.stopPropagation();useWarehouseStore.getState().selectStation('sort');}}><Boxes boxes={boxes}/><instancedMesh ref={ref} args={[undefined,undefined,22]} frustumCulled={false}><boxGeometry args={[0.65,0.55,0.65]}/><meshStandardMaterial color="#c7a67a"/></instancedMesh><Html position={[0,3,5]} center><button className="world-tag" onClick={()=>useWarehouseStore.getState().selectStation('sort')}>SORTATION LOOP B</button></Html></group>;
}

