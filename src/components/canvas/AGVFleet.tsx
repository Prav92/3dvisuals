import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group } from 'three';
import { agvPath } from './paths';
import { getMotionState } from '@/lib/simulation';
import { useWarehouseStore } from '@/store/useWarehouseStore';
function AGV({ id }: { id: number }) {
 const ref = useRef<Group>(null); const progress = useRef(id/38);
 useFrame((_,delta)=>{const s=useWarehouseStore.getState(); const eff=s.effectiveEfficiency; const phase=getMotionState(progress.current,eff,id); if(!s.paused && phase!=='queuing') progress.current=(progress.current+Math.min(delta,0.1)*s.timeSpeed*eff/100*(phase==='transit'?0.014:0.004))%1; if(ref.current) {ref.current.position.copy(agvPath.getPointAt(progress.current)); const tangent=agvPath.getTangentAt(progress.current); ref.current.rotation.y=Math.atan2(tangent.x,tangent.z);} });
 return <group ref={ref}><mesh castShadow><boxGeometry args={[0.75,0.35,1]}/><meshStandardMaterial color="#4aabb5"/></mesh><mesh position={[0,0.35,0]}><boxGeometry args={[0.6,0.35,0.7]}/><meshStandardMaterial color="#c4a47b"/></mesh><mesh position={[0,0,0.51]}><boxGeometry args={[0.55,0.09,0.03]}/><meshStandardMaterial color="#57ffcf" emissive="#57ffcf" emissiveIntensity={3} toneMapped={false}/></mesh>{id===0 && <Html position={[0,1.3,0]} center><span className="world-tag">AGV–001</span></Html>}</group>;
}
export default function AGVFleet() { return <group>{Array.from({length:38},(_,id)=><AGV key={id} id={id}/>)}</group>; }


