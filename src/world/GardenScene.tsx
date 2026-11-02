import { Canvas } from '@react-three/fiber';
import { Component, Suspense, useEffect, type ReactNode } from 'react';
import * as THREE from 'three';

function Tree({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  return <group position={[x, 0, z]} scale={size}>
    <mesh position={[0, .55, 0]}><cylinderGeometry args={[.12, .18, 1.1, 6]} /><meshStandardMaterial color="#926342" /></mesh>
    <mesh position={[0, 1.35, 0]}><icosahedronGeometry args={[.85, 1]} /><meshStandardMaterial color="#719451" flatShading /></mesh>
    <mesh position={[.2, 1.95, 0]}><icosahedronGeometry args={[.62, 1]} /><meshStandardMaterial color="#8ca75c" flatShading /></mesh>
  </group>;
}
function Cottage() {
  return <group position={[-1.6, 0, -.9]}>
    <mesh position={[0, .65, 0]}><boxGeometry args={[1.6, 1.3, 1.35]} /><meshStandardMaterial color="#f5e5be" /></mesh>
    <mesh position={[0, 1.66, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.35, .95, 4]} /><meshStandardMaterial color="#c76e46" flatShading /></mesh>
    <mesh position={[0, .4, .69]}><boxGeometry args={[.45, .8, .06]} /><meshStandardMaterial color="#866c42" /></mesh>
    <mesh position={[.51, .86, .7]}><boxGeometry args={[.32, .32, .05]} /><meshStandardMaterial color="#658b93" /></mesh>
  </group>;
}
function Rabbit() {
  return <group position={[1.1, 0, 1.2]} rotation={[0, -.3, 0]}>
    <mesh position={[0, .35, 0]} scale={[.32, .4, .26]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#fff2d8" /></mesh>
    <mesh position={[0, .76, .04]}><sphereGeometry args={[.3, 16, 12]} /><meshStandardMaterial color="#fff2d8" /></mesh>
    {[-.13, .13].map((x) => <mesh key={x} position={[x, 1.1, .03]} scale={[.07, .3, .07]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#fff2d8" /></mesh>)}
    {[-.1, .1].map((x) => <mesh key={x} position={[x, .8, .315]}><sphereGeometry args={[.027, 8, 8]} /><meshStandardMaterial color="#493f32" /></mesh>)}
    <mesh position={[0, .55, .04]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.22, .04, 6, 16]} /><meshStandardMaterial color="#719451" /></mesh>
  </group>;
}
function Garden({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <>
    <ambientLight intensity={1.6} />
    <directionalLight position={[6, 10, 4]} intensity={2.2} />
    <mesh position={[0, -.25, 0]}><boxGeometry args={[9, .5, 7]} /><meshStandardMaterial color="#a4bd71" /></mesh>
    <mesh position={[0, -.6, 0]}><boxGeometry args={[8.8, .3, 6.8]} /><meshStandardMaterial color="#b69262" /></mesh>
    <Cottage /><Rabbit />
    {[-3.5, 0, 3.3].map((x, i) => <Tree key={x} x={x} z={-2.5} size={i === 1 ? 1.15 : .9} />)}
    <Tree x={-3.6} z={1.5} size={.7} />
    <group position={[1.6, .09, -.9]}>
      <mesh><boxGeometry args={[2.1, .18, 1.5]} /><meshStandardMaterial color="#95663e" /></mesh>
      {[-.65, 0, .65].flatMap((x) => [-.4, .4].map((z) => <group key={`${x}-${z}`} position={[x, .13, z]}>
        <mesh rotation={[0, 0, .2]}><coneGeometry args={[.1, .28, 7]} /><meshStandardMaterial color="#e78c3c" /></mesh>
        <mesh position={[0, .2, 0]} scale={[.12, .2, .08]}><octahedronGeometry /><meshStandardMaterial color="#5c883f" /></mesh>
      </group>))}
    </group>
    {[-.3, .5, 1.3, 2.1].map((z) => <mesh key={z} position={[-1.6, .035, z]} rotation={[-Math.PI / 2, 0, .2]}><circleGeometry args={[.28, 7]} /><meshStandardMaterial color="#e3d6ae" /></mesh>)}
  </>;
}
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  componentDidCatch() { this.props.onFailure(); }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="scene-message" role="alert">The garden could not load. Try refreshing or opening it in another browser.</p> : this.props.children; }
}
export function GardenScene({ onReady, onFailure }: { onReady: () => void; onFailure: () => void }) {
  return <SceneBoundary onFailure={onFailure}><Canvas orthographic camera={{ position: [9, 10, 12], zoom: 55, near: .1, far: 100 }} dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} fallback={<p className="scene-message" role="alert">This browser needs WebGL to show the garden. Try another browser or device.</p>}>
    <Suspense fallback={null}><Garden onReady={onReady} /></Suspense>
  </Canvas></SceneBoundary>;
}
