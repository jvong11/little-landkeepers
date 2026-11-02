import { useBuildingStore } from '../game/buildingStore';
import { GROW_TIME, type Crop } from '../game/growing';

export function Carrot({ crop }: { crop: Crop }) {
  const ready = crop.stage === 'ripe';
  const size = crop.stage === 'growing' ? .35 + .65 * (1 - crop.remaining / GROW_TIME) : 1;
  if (crop.stage === 'seed') return <mesh position={[0, .035, 0]} scale={[.09, .04, .07]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#eac68b" /></mesh>;
  return <group scale={[size, size, size]}>
    {ready && <mesh position={[0, .08, 0]}><sphereGeometry args={[.15, 10, 8]} /><meshStandardMaterial color="#ec8a32" /></mesh>}
    {[-1, 0, 1].map((n) => <mesh key={n} position={[n * .07, .22, 0]} rotation={[0, 0, n * -.55]} scale={[.065, .23, .07]}><octahedronGeometry /><meshStandardMaterial color={ready ? '#58823c' : '#81a551'} /></mesh>)}
  </group>;
}
export function GrowingSoil({ id, position }: { id: string; position: [number, number, number] }) {
  const crop = useBuildingStore((s) => s.growing.crops[id]);
  const tool = useBuildingStore((s) => s.tool);
  const dispatch = useBuildingStore((s) => s.dispatch);
  return <group position={position} onClick={(event) => {
    if (tool === 'build') return;
    event.stopPropagation(); dispatch({ type: 'tend', soilId: id });
  }}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[.84, .72]} /><meshStandardMaterial color={crop?.stage === 'growing' ? '#604a39' : '#98704a'} />
    </mesh>
    {crop && <Carrot crop={crop} />}
    {crop?.stage === 'ripe' && <mesh position={[0, .02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.29, .32, 20]} /><meshBasicMaterial color="#e6c568" /></mesh>}
  </group>;
}
