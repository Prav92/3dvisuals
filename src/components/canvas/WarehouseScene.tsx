'use client';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, OrthographicCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Box3, Vector3 } from 'three';
import gsap from 'gsap';
import FloorGrid from './FloorGrid';
import FloorCrew from './FloorCrew';
import HighBayRacks from './HighBayRacks';
import ConveyorLoop from './ConveyorLoop';
import AGVFleet from './AGVFleet';
import LoadingDocks from './LoadingDocks';
import { useWarehouseStore } from '@/store/useWarehouseStore';
function ViewControls() {
 const ref=useRef<CameraControls>(null); const {size,camera}=useThree();
 const station=useWarehouseStore(s=>s.activeStationId); const bay=useWarehouseStore(s=>s.selectedBay); const command=useWarehouseStore(s=>s.cameraCommand);
 const baseZoom=Math.max(5,Math.min(size.width/75,size.height/53));
 useEffect(()=>{ref.current?.setBoundary(new Box3(new Vector3(-26,-2,-18),new Vector3(26,12,27)));},[]);
 useEffect(()=>{const target=station==='rack'?[-3,2,-7]:station==='sort'?[0,0,5]:station==='dock'?[-15+(bay-1)*9,0,15]:[0,0,3]; void ref.current?.setLookAt(target[0]+38,target[1]+35,target[2]+44,...target as [number,number,number],true);},[station,bay]);
 useEffect(()=>{const control=ref.current;if(!control)return; if(command.type==='reset'){void control.setLookAt(38,35,47,0,0,3,true);void control.zoomTo(baseZoom,true);}else void control.zoomTo(Math.max(4,Math.min(60,camera.zoom*(command.type==='in'?1.2:1/1.2))),true);},[command,baseZoom,camera]);
 useEffect(()=>{const tween=gsap.to(camera,{zoom:baseZoom,duration:0.65,onUpdate:()=>camera.updateProjectionMatrix()});return ()=>{tween.kill();};},[baseZoom,camera]);
 return <CameraControls ref={ref} makeDefault minZoom={4} maxZoom={60} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.6} smoothTime={0.4}/>;
}
export default function WarehouseScene() {
 return <Canvas shadows dpr={[1,1.5]} gl={{antialias:true}} fallback={<div className="scene-fallback">WebGL is unavailable. Simulation controls and telemetry remain available.</div>}><color attach="background" args={['#0d1b27']}/><OrthographicCamera makeDefault position={[38,35,47]} zoom={14} near={0.1} far={250}/><ViewControls/><ambientLight intensity={1.3}/><directionalLight position={[10,30,10]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35}/><Suspense fallback={null}><FloorGrid/><HighBayRacks/><ConveyorLoop/><AGVFleet/><FloorCrew/><LoadingDocks/></Suspense><EffectComposer multisampling={0}><Bloom luminanceThreshold={1.2} intensity={0.35} mipmapBlur/></EffectComposer></Canvas>;
}

