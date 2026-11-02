import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { BOARD, cells, footprint, growing, items, key, picnic, placementError, type Cell, type GardenObject } from '../game/building';
import { useBuildingStore } from '../game/buildingStore';
import { CAMERA_POSITION, gardenZoom } from './camera';
import { PieceModel, Rabbit, Tree } from './GardenPieces';

const noRaycast = () => {};
function worldCenter(object: Pick<GardenObject, 'kind' | 'rotation' | 'x' | 'z'>): [number, number, number] {
  const { width, depth } = footprint(object.kind, object.rotation);
  return [object.x + width / 2 - BOARD.width / 2, 0, object.z + depth / 2 - BOARD.depth / 2];
}
function ResponsiveCamera({ onMoveAnchor }: { onMoveAnchor: (point: { x: number; y: number } | null) => void }) {
  const draft = useBuildingStore((s) => s.garden.draft);
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = gardenZoom(size.width, size.height);
    ortho.lookAt(0, 0, 0);
    ortho.updateProjectionMatrix();
    if (draft?.movingId && draft.pending && draft.position) {
      const center = worldCenter({ kind: draft.kind, rotation: draft.rotation, ...draft.position });
      const projected = new THREE.Vector3(center[0], 1, center[2]).project(ortho);
      onMoveAnchor({ x: (projected.x + 1) * size.width / 2, y: (1 - projected.y) * size.height / 2 });
    } else onMoveAnchor(null);
    invalidate();
  }, [camera, size.width, size.height, invalidate, draft, onMoveAnchor]);
  return null;
}
function GroundMark({ c, color, opacity = .3 }: { c: Cell; color: string; opacity?: number }) {
  return <mesh position={[c.x + .5 - BOARD.width / 2, .012, c.z + .5 - BOARD.depth / 2]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
    <planeGeometry args={[.94, .94]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
  </mesh>;
}
function Garden({ onReady, onMoveAnchor }: { onReady: () => void; onMoveAnchor: (point: { x: number; y: number } | null) => void }) {
  const garden = useBuildingStore((s) => s.garden);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const [hover, setHover] = useState<Cell | null>(null);
  const draft = garden.draft;
  const previewPosition = draft?.position ?? hover;
  const preview = draft && previewPosition ? { ...draft, position: previewPosition } : null;
  const error = preview ? placementError(garden.objects, preview) : null;
  const ghost = preview?.position ? { kind: preview.kind, rotation: preview.rotation, ...preview.position } : null;
  const grid = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let x = 0; x <= BOARD.width; x++) points.push(new THREE.Vector3(x - 5, .008, -4), new THREE.Vector3(x - 5, .008, 4));
    for (let z = 0; z <= BOARD.depth; z++) points.push(new THREE.Vector3(-5, .008, z - 4), new THREE.Vector3(5, .008, z - 4));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  useEffect(() => () => grid.dispose(), [grid]);
  useEffect(onReady, [onReady]);
  useEffect(() => { setHover(null); }, [draft?.kind, draft?.movingId]);
  const cellAt = (event: ThreeEvent<PointerEvent | MouseEvent>): Cell => ({ x: Math.floor(event.point.x + BOARD.width / 2), z: Math.floor(event.point.z + BOARD.depth / 2) });
  const chooseCell = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (draft) dispatch({ type: 'tap', position: cellAt(event) });
  };
  return <>
    <ResponsiveCamera onMoveAnchor={onMoveAnchor} />
    <ambientLight intensity={1.5} /><directionalLight position={[6, 10, 4]} intensity={2.2} />
    <mesh position={[0, -.23, 0]}><boxGeometry args={[10.4, .46, 8.4]} /><meshStandardMaterial color="#a9be79" /></mesh>
    <mesh position={[0, -.55, 0]}><boxGeometry args={[10.1, .2, 8.1]} /><meshStandardMaterial color="#b99768" /></mesh>
    {draft && <lineSegments geometry={grid} raycast={noRaycast}><lineBasicMaterial color="#6c8656" transparent opacity={.35} /></lineSegments>}
    {growing.map((c) => <GroundMark key={`grow-${key(c)}`} c={c} color="#cfa46a" />)}
    {picnic.map((c) => <GroundMark key={`picnic-${key(c)}`} c={c} color="#e2bd8d" opacity={.55} />)}
    <GroundMark c={{ x: 5, z: 7 }} color="#e2d2a5" opacity={.8} />

    <group position={[3, .025, 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}><planeGeometry args={[1.8, 1.8]} /><meshStandardMaterial color="#f0ce9e" /></mesh>

    </group>
    <group position={[.5, 0, 3.5]}><Rabbit /></group>
    {[[-5.6, -3.6, .95], [-2.6, -4.7, 1.1], [1.8, -4.8, .9], [5.6, -2.5, 1], [-5.7, 1.5, .7]].map(([x, z, size]) => <Tree key={x} x={x} z={z} size={size} />)}
    {garden.objects.map((object) => <group key={object.id} position={worldCenter(object)} rotation={[0, object.rotation * Math.PI / 2, 0]} onClick={(event) => {
      event.stopPropagation();
      if (draft) dispatch({ type: 'tap', position: { x: object.x, z: object.z } });
      else dispatch({ type: 'select', id: object.id });
    }}>
      <PieceModel kind={object.kind} />
    </group>)}
    {draft?.movingId && garden.objects.filter((o) => o.id === draft.movingId).flatMap((o) => cells(o)).map((c) => <GroundMark key={`selected-${key(c)}`} c={c} color="#e0b453" opacity={.7} />)}
    {ghost && <>
      {cells(ghost).map((c) => <GroundMark key={`ghost-${key(c)}`} c={c} color={error ? '#cf6049' : '#417d68'} opacity={.75} />)}
      <group position={worldCenter(ghost)} rotation={[0, ghost.rotation * Math.PI / 2, 0]}>
        <mesh position={[0, .08, 0]} raycast={noRaycast}>
          <boxGeometry args={[items[ghost.kind].width - .12, .12, items[ghost.kind].depth - .12]} />
          <meshBasicMaterial color={error ? '#cf6049' : '#417d68'} transparent opacity={.65} depthWrite={false} />
        </mesh>
        <group raycast={noRaycast}>
          {/* A wireframe volume stays readable even over an existing object. */}
          <mesh position={[0, ghost.kind === 'home' ? .85 : .45, 0]} raycast={noRaycast}>
            <boxGeometry args={[items[ghost.kind].width - .12, ghost.kind === 'home' ? 1.7 : .8, items[ghost.kind].depth - .12]} />
            <meshBasicMaterial color={error ? '#b84e39' : '#316b58'} wireframe />
          </mesh>
        </group>
      </group>
    </>}
    <mesh position={[0, .005, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={chooseCell} onPointerMove={(event) => {
      if (draft && !draft.position && event.pointerType === 'mouse') {
        const next = cellAt(event); setHover((old) => old && key(old) === key(next) ? old : next);
      }
    }} onPointerLeave={() => setHover(null)}>
      <planeGeometry args={[10, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </>;
}
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  componentDidCatch() { this.props.onFailure(); }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="scene-message" role="alert">The garden could not load. Try refreshing or opening it in another browser.</p> : this.props.children; }
}
export function GardenScene({ onReady, onFailure, onMoveAnchor }: { onReady: () => void; onFailure: () => void; onMoveAnchor: (point: { x: number; y: number } | null) => void }) {
  return <SceneBoundary onFailure={onFailure}><Canvas orthographic camera={{ position: CAMERA_POSITION, zoom: 40, near: .1, far: 100 }} dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} fallback={<p className="scene-message" role="alert">This browser needs WebGL to show the garden. Try another browser or device.</p>}>
    <Suspense fallback={null}><Garden onReady={onReady} onMoveAnchor={onMoveAnchor} /></Suspense>
  </Canvas></SceneBoundary>;
}
