import { Html } from '@react-three/drei';
import Boxes, { type Box } from './Boxes';
import { useWarehouseStore } from '@/store/useWarehouseStore';
const boxes: Box[] = [];
for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) {
 const x = -16 + col * 6, z = -10 + row * 3.3;
 for (const dx of [-2.3, 2.3]) for (const dz of [-0.75, 0.75]) boxes.push({ position: [x + dx, 2.6, z + dz], scale: [0.14, 5.2, 0.14], color: '#507c9a' });
 for (let level = 0; level < 3; level++) {
 const y = 0.4 + level * 1.65;
 boxes.push({ position: [x, y, z], scale: [4.8, 0.17, 1.7], color: '#d6ab61' });
 for (let b = 0; b < 4; b++) boxes.push({ position: [x - 1.75 + b * 1.15, y + 0.65, z], scale: [0.98, 1.12, 1.3], color: ['#a58d6c', '#c4a47b', '#b89f7d', '#7d9ca7'][(b + row + col + level) % 4] });
 }
}
export default function HighBayRacks() { return <group onClick={e => { e.stopPropagation(); useWarehouseStore.getState().selectStation('rack'); }}><Boxes boxes={boxes} /><Html position={[-3, 6.6, -7]} center><button className="world-tag" onClick={() => useWarehouseStore.getState().selectStation('rack')}>AUTOMATED RACKING / A03</button></Html></group>; }


