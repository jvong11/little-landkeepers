import type { ItemKind } from '../game/building';
const cream = '#f2ddb2';
const wood = '#ad784c';
function Box({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={position}><boxGeometry args={size} /><meshStandardMaterial color={color} /></mesh>;
}
export function Home() {
  return <group>
    <Box position={[0, .63, 0]} size={[1.65, 1.26, 1.6]} color={cream} />
    <mesh position={[0, 1.65, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.4, .94, 4]} /><meshStandardMaterial color="#c87950" flatShading /></mesh>
    <Box position={[-.48, .42, .83]} size={[.5, .84, .08]} color="#73915b" />
    <mesh position={[-.33, .43, .89]}><sphereGeometry args={[.04, 8, 8]} /><meshStandardMaterial color="#e2c275" /></mesh>
    <Box position={[.4, .82, .83]} size={[.44, .44, .06]} color="#719caa" />
    <Box position={[.4, .82, .88]} size={[.045, .5, .05]} color={cream} />
    <Box position={[.4, .82, .88]} size={[.5, .045, .05]} color={cream} />
    <Box position={[.55, 1.65, -.25]} size={[.28, .75, .3]} color={cream} />
    <Box position={[0, .055, .96]} size={[1.25, .11, .25]} color="#cfbf96" />
  </group>;
}
export function Bed({ planted = false }: { planted?: boolean }) {
  return <group>
    <Box position={[0, .08, 0]} size={[1.82, .16, .82]} color="#78543d" />
    {[-.45, .45].map((z) => <Box key={z} position={[0, .15, z]} size={[1.94, .22, .09]} color={wood} />)}
    {[-.94, .94].map((x) => <Box key={x} position={[x, .15, 0]} size={[.09, .22, .9]} color={wood} />)}
    {planted && [-.58, 0, .58].map((x) => <group key={x} position={[x, .24, 0]}>
      <mesh><coneGeometry args={[.11, .25, 7]} /><meshStandardMaterial color="#e58b37" /></mesh>
      <mesh position={[0, .2, 0]} scale={[.14, .23, .1]}><octahedronGeometry /><meshStandardMaterial color="#648d43" /></mesh>
    </group>)}
  </group>;
}
export function Flowers() {
  return <group>
    <mesh position={[0, .14, 0]}><cylinderGeometry args={[.3, .22, .28, 10]} /><meshStandardMaterial color="#bf7756" /></mesh>
    {[-.17, 0, .17].map((x, i) => <group key={x} position={[x, .42 + (i % 2) * .16, 0]}>
      <mesh position={[0, -.1, 0]}><cylinderGeometry args={[.025, .025, .3, 5]} /><meshStandardMaterial color="#648d43" /></mesh>
      {[0, 1, 2, 3, 4].map((n) => <mesh key={n} position={[Math.cos(n * Math.PI * 2 / 5) * .11, Math.sin(n * Math.PI * 2 / 5) * .11, .04]}><sphereGeometry args={[.09, 8, 6]} /><meshStandardMaterial color={i === 1 ? '#e7b65f' : '#f2d6a5'} /></mesh>)}
      <mesh position={[0, 0, .1]}><sphereGeometry args={[.055, 8, 6]} /><meshStandardMaterial color="#b47c42" /></mesh>
    </group>)}
  </group>;
}
export function Lantern() {
  return <group>
    <Box position={[0, .58, 0]} size={[.1, 1.16, .1]} color={wood} />
    <Box position={[0, 1.05, .08]} size={[.38, .4, .34]} color="#e6b65c" />
    <mesh position={[0, 1.34, .08]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[.34, .2, 4]} /><meshStandardMaterial color="#6b7951" /></mesh>
    <Box position={[0, .84, .08]} size={[.43, .06, .39]} color="#6b7951" />
  </group>;
}
export function Bench() {
  return <group>
    <Box position={[0, .38, 0]} size={[1.7, .12, .65]} color={wood} />
    <Box position={[0, .75, -.29]} size={[1.7, .4, .1]} color="#bf8e59" />
    {[-.6, .6].map((x) => <Box key={x} position={[x, .18, 0]} size={[.12, .36, .54]} color="#7b5a3f" />)}
  </group>;
}
export function PieceModel({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case 'home': return <Home />;
    case 'bed': return <Bed />;
    case 'flowers': return <Flowers />;
    case 'lantern': return <Lantern />;
    case 'bench': return <Bench />;
    case 'path': return <mesh position={[0, .025, 0]} rotation={[-Math.PI / 2, 0, .1]}><circleGeometry args={[.44, 7]} /><meshStandardMaterial color="#dfd0aa" /></mesh>;
  }
}
export function Tree({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  return <group position={[x, 0, z]} scale={size}>
    <mesh position={[0, .55, 0]}><cylinderGeometry args={[.12, .18, 1.1, 6]} /><meshStandardMaterial color="#926342" /></mesh>
    <mesh position={[0, 1.35, 0]}><icosahedronGeometry args={[.85, 1]} /><meshStandardMaterial color="#719451" flatShading /></mesh>
    <mesh position={[.2, 1.95, 0]}><icosahedronGeometry args={[.62, 1]} /><meshStandardMaterial color="#8ca75c" flatShading /></mesh>
  </group>;
}
export function Rabbit() {
  return <group rotation={[0, -.3, 0]}>
    <mesh position={[0, .35, 0]} scale={[.28, .36, .24]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#fff2d8" /></mesh>
    <mesh position={[0, .72, .04]}><sphereGeometry args={[.27, 16, 12]} /><meshStandardMaterial color="#fff2d8" /></mesh>
    {[-.12, .12].map((x) => <mesh key={x} position={[x, 1.02, .03]} scale={[.065, .27, .065]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#fff2d8" /></mesh>)}
    {[-.09, .09].map((x) => <mesh key={x} position={[x, .75, .29]}><sphereGeometry args={[.027, 8, 8]} /><meshStandardMaterial color="#493f32" /></mesh>)}
    <mesh position={[0, .53, .04]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.2, .04, 6, 16]} /><meshStandardMaterial color="#719451" /></mesh>
  </group>;
}
