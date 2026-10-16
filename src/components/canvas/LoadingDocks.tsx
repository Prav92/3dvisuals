import { Html } from '@react-three/drei';
import Boxes, { type Box } from './Boxes';
import { useWarehouseStore } from '@/store/useWarehouseStore';
function Dock({ bay }: { bay: number }) {
 const selected=useWarehouseStore(s=>s.selectedBay===bay && s.activeStationId==='dock');
 const x=-15+(bay-1)*9;
 const boxes:Box[]=[{position:[x,0.15,14],scale:[5,0.3,2],color:selected?'#4d9e93':'#526778'},{position:[x,1.6,18],scale:[3.6,2.7,5.8],color:'#b4c1c6'},{position:[x,1.2,21.8],scale:[3.6,1.8,1.9],color:bay%2?'#e8ba60':'#4f91a1'},{position:[x,1.6,22.78],scale:[3.1,0.7,0.05],color:'#213d50'}];
 for(const dx of [-1.9,1.9]) for(const z of [16,20,21.8]) boxes.push({position:[x+dx,0.4,z],scale:[0.3,0.7,0.8],color:'#101e28'});
 return <group onClick={e=>{e.stopPropagation();useWarehouseStore.getState().selectBay(bay);}}><Boxes boxes={boxes}/><Html position={[x,0.7,13]} center><button className="world-tag" onClick={()=>useWarehouseStore.getState().selectBay(bay)}>BAY 0{bay}</button></Html></group>;
}
export default function LoadingDocks() {return <group>{[1,2,3,4].map(bay=><Dock key={bay} bay={bay}/>)}</group>;}


