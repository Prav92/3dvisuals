'use client';
import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import Factory from './Factory';
import Robots from './Robots';
import Crew from './Crew';

function ResponsiveZoom() {
  const { size, camera } = useThree();
  useEffect(() => {
    camera.zoom = Math.max(6, Math.min(size.width / 62, size.height / 44));
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export default function AssemblyScene() {
  return (
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }} fallback={<div className="asm-fallback">WebGL is unavailable. Telemetry and controls remain available.</div>}>
      <color attach="background" args={['#0d1117']} />
      <OrthographicCamera makeDefault position={[32, 26, 32]} zoom={14} near={0.1} far={300} />
      <ResponsiveZoom />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} target={[0, 1, 1]} minZoom={6} maxZoom={60} maxPolarAngle={Math.PI / 2.15} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[14, 30, 12]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={32} shadow-camera-bottom={-32} />
      <Suspense fallback={null}>
        <Factory />
        <Robots />
        <Crew />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={1.2} intensity={0.45} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
