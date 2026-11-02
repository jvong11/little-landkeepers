import { describe, expect, it } from 'vitest';
import { buildingReducer as reduce, cells, createBuildingState, footprint, items, placementError, type BuildingState, type Draft, type GardenObject } from './building';
const draft = (kind: Draft['kind'], x: number, z: number, rotation: Draft['rotation'] = 0): Draft => ({ kind, position: { x, z }, rotation });
describe('garden placement', () => {
  it('rotates rectangular footprints', () => {
    expect(footprint('bench', 0)).toEqual({ width: 2, depth: 1 });
    expect(footprint('bench', 1)).toEqual({ width: 1, depth: 2 });
    expect(cells({ kind: 'bench', x: 2, z: 3, rotation: 1 })).toEqual([{ x: 2, z: 3 }, { x: 2, z: 4 }]);
  });
  it('accepts each starter object in its initial position', () => {
    const { objects } = createBuildingState();
    for (const object of objects) expect(placementError(objects, { ...draft(object.kind, object.x, object.z, object.rotation), movingId: object.id })).toBeNull();
  });
  it.each([[9, 0], [-1, 0], [0, 8], [0.5, 0]])('rejects a bed outside the grid at %s %s', (x, z) => expect(placementError([], draft('bed', x, z))).toMatch(/past the garden/));
  it('rejects overlapping solid pieces and duplicate paths', () => {
    const { objects } = createBuildingState();
    expect(placementError(objects, draft('bed', 1, 1))).toMatch(/already here/);
    expect(placementError(objects, draft('path', 1, 3))).toMatch(/already here/);
  });
  it('lets paths occupy a separate layer beneath solid objects', () => expect(placementError(createBuildingState().objects, draft('path', 1, 1))).toBeNull());
  it.each([[1, 5], [7, 5], [5, 7]])('protects shared terrain at %s %s', (x, z) => expect(placementError([], draft('flowers', x, z))).toMatch(/shared space/));
  it('keeps a clear approach to home doors', () => {
    expect(placementError(createBuildingState().objects, draft('flowers', 1, 3))).toMatch(/front door/);
    expect(placementError([], draft('home', 1, 6))).toMatch(/front door/);
  });
  it('rejects sealing off the entry from the garden', () => {
    const objects: GardenObject[] = [{ id: 'left', kind: 'flowers', x: 4, z: 7, rotation: 0 }, { id: 'right', kind: 'flowers', x: 6, z: 7, rotation: 0 }];
    expect(placementError(objects, draft('flowers', 5, 6))).toMatch(/Leave a way/);
  });
  it('enforces available pieces', () => {
    const objects: GardenObject[] = Array.from({ length: items.lantern.supply }, (_, x) => ({ id: `lamp-${x}`, x, z: 0, kind: 'lantern', rotation: 0 }));
    expect(placementError(objects, draft('lantern', 0, 2))).toMatch(/All of those/);
  });
});
describe('building transactions', () => {
  it('leaves the committed world unchanged while moving and on cancellation', () => {
    const initial = createBuildingState();
    let state = reduce(initial, { type: 'select', id: 'piece-2' });
    state = reduce(state, { type: 'position', position: { x: 3, z: 3 } });
    state = reduce(state, { type: 'rotate' });
    expect(state.objects).toBe(initial.objects);
    state = reduce(state, { type: 'cancel' });
    expect(state.objects).toBe(initial.objects);
    expect(state.draft).toBeNull();
  });
  it('moves one object without changing its identity', () => {
    let state = createBuildingState();
    state = reduce(state, { type: 'select', id: 'piece-2' });
    state = reduce(state, { type: 'position', position: { x: 3, z: 3 } });
    state = reduce(state, { type: 'confirm' });
    expect(state.objects).toHaveLength(4);
    expect(state.objects.find((o) => o.id === 'piece-2')).toMatchObject({ x: 3, z: 3 });
    expect(state.nextId).toBe(5);
  });
  it('does not commit invalid placements or duplicate on repeated confirmation', () => {
    let state = reduce(createBuildingState(), { type: 'choose', kind: 'flowers' });
    state = reduce(state, { type: 'position', position: { x: 1, z: 1 } });
    const rejected = reduce(state, { type: 'confirm' });
    expect(rejected.objects).toBe(state.objects);
    state = reduce(state, { type: 'position', position: { x: 4, z: 2 } });
    state = reduce(state, { type: 'confirm' });
    state = reduce(state, { type: 'confirm' });
    expect(state.objects).toHaveLength(5);
    expect(new Set(state.objects.map((o) => o.id)).size).toBe(5);
  });
  it('returns pieces to supply and never reuses IDs', () => {
    let state: BuildingState = createBuildingState();
    state = reduce(state, { type: 'select', id: 'piece-1' });
    state = reduce(state, { type: 'remove' });
    expect(state.objects.filter((o) => o.kind === 'home')).toHaveLength(0);
    state = reduce(state, { type: 'choose', kind: 'home' });
    state = reduce(state, { type: 'position', position: { x: 1, z: 1 } });
    state = reduce(state, { type: 'confirm' });
    expect(state.objects.find((o) => o.kind === 'home')?.id).toBe('piece-5');
  });
  it('a full turn restores orientation and switching tools abandons the draft', () => {
    let state = reduce(createBuildingState(), { type: 'choose', kind: 'bench' });
    for (let i = 0; i < 4; i++) state = reduce(state, { type: 'rotate' });
    expect(state.draft?.rotation).toBe(0);
    state = reduce(state, { type: 'choose', kind: 'path' });
    expect(state.draft).toEqual({ kind: 'path', rotation: 0, position: null });
    expect(state.objects).toHaveLength(4);
  });
});
