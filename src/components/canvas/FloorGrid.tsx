import { Grid, Line } from '@react-three/drei';
import { agvPath } from './paths';
export default function FloorGrid() { return <group><mesh position={[0,-0.35,1]} receiveShadow><boxGeometry args={[43,0.7,29]} /><meshStandardMaterial color="#263e4c" /></mesh><Grid position={[0,0.015,1]} args={[42,28]} cellSize={2} cellThickness={0.5} cellColor="#47606b" sectionSize={10} sectionColor="#587681" fadeDistance={100} /><Line points={agvPath.getPoints(160).map(p => [p.x, 0.045, p.z] as [number,number,number])} color="#42e4c1" lineWidth={2} /><mesh position={[-21,0.6,1]}><boxGeometry args={[0.3,1.2,28]} /><meshStandardMaterial color="#405b69" /></mesh><mesh position={[0,0.8,-13]}><boxGeometry args={[42,1.6,0.3]} /><meshStandardMaterial color="#405b69" /></mesh></group>; }

