export type ItemKind = 'home' | 'bed' | 'path' | 'flowers' | 'lantern' | 'bench';
export type Rotation = 0 | 1 | 2 | 3;
export interface Cell { x: number; z: number }
export interface GardenObject extends Cell { id: string; kind: ItemKind; rotation: Rotation }
export interface Draft { kind: ItemKind; rotation: Rotation; position: Cell | null; movingId?: string }
export interface BuildingState { objects: GardenObject[]; draft: Draft | null; nextId: number; message: string }
export const BOARD = { width: 10, depth: 8 };
export const items: Record<ItemKind, { name: string; icon: string; width: number; depth: number; supply: number; layer: 'ground' | 'solid' }> = {
  home: { name: 'Home', icon: '⌂', width: 2, depth: 2, supply: 3, layer: 'solid' },
  bed: { name: 'Garden bed', icon: '🌱', width: 2, depth: 1, supply: 6, layer: 'solid' },
  path: { name: 'Path', icon: '◈', width: 1, depth: 1, supply: 36, layer: 'ground' },
  flowers: { name: 'Flowers', icon: '✿', width: 1, depth: 1, supply: 12, layer: 'solid' },
  lantern: { name: 'Lantern', icon: '☀', width: 1, depth: 1, supply: 6, layer: 'solid' },
  bench: { name: 'Bench', icon: '▰', width: 2, depth: 1, supply: 4, layer: 'solid' },
};
export const entry: Cell = { x: 5, z: 7 };
export const growing: Cell[] = [{ x: 1, z: 5 }, { x: 2, z: 5 }];
export const picnic: Cell[] = [{ x: 7, z: 5 }, { x: 8, z: 5 }, { x: 7, z: 6 }, { x: 8, z: 6 }];
export const key = ({ x, z }: Cell) => `${x},${z}`;
export const inside = ({ x, z }: Cell) => Number.isInteger(x) && Number.isInteger(z) && x >= 0 && z >= 0 && x < BOARD.width && z < BOARD.depth;
export function footprint(kind: ItemKind, rotation: Rotation) {
  const item = items[kind];
  return rotation % 2 ? { width: item.depth, depth: item.width } : { width: item.width, depth: item.depth };
}
export function cells(object: Pick<GardenObject, 'x' | 'z' | 'kind' | 'rotation'>): Cell[] {
  const { width, depth } = footprint(object.kind, object.rotation);
  return Array.from({ length: width * depth }, (_, i) => ({ x: object.x + i % width, z: object.z + Math.floor(i / width) }));
}
function neighbors(c: Cell): Cell[] { return [{ x: c.x + 1, z: c.z }, { x: c.x - 1, z: c.z }, { x: c.x, z: c.z + 1 }, { x: c.x, z: c.z - 1 }]; }
function door(object: GardenObject): Cell {
  const { width, depth } = footprint(object.kind, object.rotation);
  switch (object.rotation) {
    case 0: return { x: object.x, z: object.z + depth };
    case 1: return { x: object.x + width, z: object.z + depth - 1 };
    case 2: return { x: object.x + width - 1, z: object.z - 1 };
    case 3: return { x: object.x - 1, z: object.z };
  }
}
export function placementError(objects: GardenObject[], draft: Draft): string | null {
  if (!draft.position) return 'Choose a space in the garden.';
  const candidate: GardenObject = { id: draft.movingId ?? 'preview', kind: draft.kind, rotation: draft.rotation, ...draft.position };
  const occupied = cells(candidate);
  if (!occupied.every(inside)) return 'That piece reaches past the garden. Try another space.';
  const terrain = new Set([...growing, ...picnic, entry].map(key));
  if (occupied.some((c) => terrain.has(key(c)))) return 'Keep this shared space open for growing, picnics, and arriving friends.';
  const remaining = objects.filter((o) => o.id !== draft.movingId);
  if (!draft.movingId && remaining.filter((o) => o.kind === draft.kind).length >= items[draft.kind].supply) return 'All of those pieces are in the garden. Move one or return one to the tray.';
  // Paths form a separate ground layer, so they may pass beneath a home or decoration.
  const sameLayer = new Set(remaining.filter((o) => items[o.kind].layer === items[draft.kind].layer).flatMap(cells).map(key));
  if (occupied.some((c) => sameLayer.has(key(c)))) return 'Something is already here. Try another space.';
  const proposed = [...remaining, candidate];
  const blocked = new Set([...growing, ...picnic, ...proposed.filter((o) => items[o.kind].layer === 'solid').flatMap(cells)].map(key));
  const reachable = new Set<string>([key(entry)]);
  const queue: Cell[] = [entry];
  for (let i = 0; i < queue.length; i++) for (const next of neighbors(queue[i])) {
    if (inside(next) && !blocked.has(key(next)) && !reachable.has(key(next))) { reachable.add(key(next)); queue.push(next); }
  }
  if (![growing, picnic].every((zone) => zone.some((c) => neighbors(c).some((n) => reachable.has(key(n)))))) return 'Leave a way for friends to reach the growing patch and picnic.';
  if (proposed.some((o) => o.kind === 'home' && !reachable.has(key(door(o))))) return 'Leave a clear way to every home’s front door. Try moving or turning this piece.';
  return null;
}
export function createBuildingState(): BuildingState {
  return {
    objects: [
      { id: 'piece-1', kind: 'home', x: 1, z: 1, rotation: 0 },
      { id: 'piece-2', kind: 'bed', x: 7, z: 1, rotation: 0 },
      { id: 'piece-3', kind: 'path', x: 1, z: 3, rotation: 0 },
      { id: 'piece-4', kind: 'flowers', x: 0, z: 3, rotation: 0 },
    ], draft: null, nextId: 5, message: 'Welcome! Choose a piece, or tap something in your garden to move it.',
  };
}
export type BuildingAction =
  | { type: 'choose'; kind: ItemKind }
  | { type: 'select'; id: string }
  | { type: 'position'; position: Cell }
  | { type: 'nudge'; dx: number; dz: number }
  | { type: 'rotate' }
  | { type: 'confirm' }
  | { type: 'cancel' }
  | { type: 'remove' };
export function buildingReducer(state: BuildingState, action: BuildingAction): BuildingState {
  switch (action.type) {
    case 'choose':
      if (state.objects.filter((o) => o.kind === action.kind).length >= items[action.kind].supply) return { ...state, message: 'All of those pieces are in use. Return one to the tray first.' };
      return { ...state, draft: { kind: action.kind, rotation: 0, position: null }, message: `Choose a spot for your ${items[action.kind].name.toLowerCase()}.` };
    case 'select': {
      const object = state.objects.find((o) => o.id === action.id);
      return object ? { ...state, draft: { kind: object.kind, rotation: object.rotation, position: { x: object.x, z: object.z }, movingId: object.id }, message: 'Choose a new spot, turn it, or return it to the tray.' } : state;
    }
    case 'position': return state.draft ? { ...state, draft: { ...state.draft, position: action.position } } : state;
    case 'nudge': {
      if (!state.draft) return state;
      const start = state.draft.position ?? { x: 0, z: 0 };
      return { ...state, draft: { ...state.draft, position: { x: Math.max(0, Math.min(BOARD.width - 1, start.x + action.dx)), z: Math.max(0, Math.min(BOARD.depth - 1, start.z + action.dz)) } } };
    }
    case 'rotate': return state.draft ? { ...state, draft: { ...state.draft, rotation: ((state.draft.rotation + 1) % 4) as Rotation } } : state;
    case 'cancel': return { ...state, draft: null, message: 'No changes made. Keep exploring your garden.' };
    case 'confirm': {
      if (!state.draft) return state;
      const error = placementError(state.objects, state.draft);
      if (error) return { ...state, message: error };
      const draft = state.draft;
      const object: GardenObject = { ...draft.position!, kind: draft.kind, rotation: draft.rotation, id: draft.movingId ?? `piece-${state.nextId}` };
      return { ...state, objects: [...state.objects.filter((o) => o.id !== draft.movingId), object], draft: null, nextId: state.nextId + (draft.movingId ? 0 : 1), message: `${items[draft.kind].name} ${draft.movingId ? 'moved' : 'placed'}! What would you like to make next?` };
    }
    case 'remove': {
      const id = state.draft?.movingId;
      return id ? { ...state, objects: state.objects.filter((o) => o.id !== id), draft: null, message: 'Returned to the tray. You can use that piece again.' } : state;
    }
  }
}
