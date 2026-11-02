import { describe, expect, it } from 'vitest';
import { createGameState, gardenReducer as reduce, type GameState } from './garden';
import { createGrowingState, GROW_TIME, growCrops, patchSoils, soilId, tendSoil } from './growing';

function gardenWithBed(): GameState {
  let state = reduce(createGameState(), { type: 'tap', position: { x: 1, z: 1 } });
  state = reduce(state, { type: 'choose', kind: 'bed' });
  return reduce(state, { type: 'tap', position: { x: 4, z: 2 } });
}
function ripe(state: GameState): GameState {
  for (let i = 0; i < GROW_TIME / 1000; i++) state = reduce(state, { type: 'grow', elapsed: 1000 });
  return state;
}
describe('carrots', () => {
  it('plants once, requires water, and rejects harvesting before ripe', () => {
    let state = createGrowingState();
    state = tendSoil(state, patchSoils[0], 'water', patchSoils);
    expect(state.crops).toEqual({});
    state = tendSoil(state, patchSoils[0], 'seed', patchSoils);
    state = tendSoil(state, patchSoils[0], 'seed', patchSoils);
    expect(Object.keys(state.crops)).toHaveLength(1);
    state = growCrops(state, 1000);
    expect(state.crops[patchSoils[0]].stage).toBe('seed');
    state = tendSoil(state, patchSoils[0], 'harvest', patchSoils);
    expect(state.basket).toBe(0);
    state = tendSoil(state, patchSoils[0], 'water', patchSoils);
    state = growCrops(state, 1000);
    const progress = state.crops[patchSoils[0]];
    state = tendSoil(state, patchSoils[0], 'water', patchSoils);
    expect(state.crops[patchSoils[0]]).toBe(progress);
    expect(tendSoil(state, patchSoils[0], 'harvest', patchSoils).basket).toBe(0);
  });
  it('bounds active growth steps and ignores invalid clock values', () => {
    let state = tendSoil(createGrowingState(), patchSoils[0], 'seed', patchSoils);
    state = tendSoil(state, patchSoils[0], 'water', patchSoils);
    for (const elapsed of [0, -1, NaN, Infinity]) expect(growCrops(state, elapsed)).toBe(state);
    state = growCrops(state, 1000000);
    expect(state.crops[patchSoils[0]]).toEqual({ stage: 'growing', remaining: GROW_TIME - 1000 });
  });
  it('yields exactly one carrot per plant, cannot double harvest, and allows replanting', () => {
    let state = gardenWithBed();
    for (const tool of ['seed', 'water'] as const) {
      state = reduce(state, { type: 'tool', tool });
      state = reduce(state, { type: 'tend', soilId: patchSoils[0] });
    }
    state = ripe(state);
    state = reduce(state, { type: 'tool', tool: 'harvest' });
    for (let i = 0; i < 10; i++) state = reduce(state, { type: 'tend', soilId: patchSoils[0] });
    expect(state.growing.basket).toBe(1);
    expect(state.growing.crops).toEqual({});
    state = reduce(state, { type: 'tool', tool: 'seed' });
    state = reduce(state, { type: 'tend', soilId: patchSoils[0] });
    expect(state.growing.basket).toBe(1);
    expect(state.growing.crops[patchSoils[0]].stage).toBe('seed');
  });
  it('rejects unknown soils, build-tool clicks, and planting before Pip has a home', () => {
    const empty = createGameState();
    expect(reduce(empty, { type: 'tool', tool: 'seed' })).toBe(empty);
    expect(reduce(empty, { type: 'tend', soilId: patchSoils[0] })).toBe(empty);
    let state = gardenWithBed();
    state = reduce(state, { type: 'tend', soilId: patchSoils[0] });
    expect(state.growing.crops).toEqual({});
    state = reduce(state, { type: 'tool', tool: 'seed' });
    for (const id of ['nonexistent:0', 'piece-1:0', 'piece-2:2']) state = reduce(state, { type: 'tend', soilId: id });
    expect(state.growing.crops).toEqual({});
  });
});
describe('building with crops', () => {
  it('preserves crop identity and progress across bed movement, turning, and undo', () => {
    const id = soilId('piece-2', 0);
    let state = gardenWithBed();
    for (const tool of ['seed', 'water'] as const) {
      state = reduce(state, { type: 'tool', tool });
      state = reduce(state, { type: 'tend', soilId: id });
    }
    state = reduce(state, { type: 'grow', elapsed: 1000 });
    const crop = state.growing.crops[id];
    state = reduce(state, { type: 'select', id: 'piece-2' });
    state = reduce(state, { type: 'rotate' });
    state = reduce(state, { type: 'tap', position: { x: 6, z: 2 } });
    expect(state.garden.objects.find((o) => o.id === 'piece-2')).toMatchObject({ x: 6, z: 2, rotation: 1 });
    expect(state.growing.crops[id]).toBe(crop);
    state = ripe(state);
    state = reduce(state, { type: 'undo' });
    expect(state.garden.objects.find((o) => o.id === 'piece-2')).toMatchObject({ x: 4, z: 2, rotation: 0 });
    expect(state.growing.crops[id].stage).toBe('ripe');
  });
  it('protects planted beds from return and placement undo, then permits removal after harvest', () => {
    const id = soilId('piece-2', 0);
    let state = gardenWithBed();
    state = reduce(state, { type: 'tool', tool: 'seed' });
    state = reduce(state, { type: 'tend', soilId: id });
    state = reduce(state, { type: 'undo' });
    expect(state.garden.objects).toHaveLength(2);
    state = reduce(state, { type: 'select', id: 'piece-2' });
    state = reduce(state, { type: 'remove' });
    expect(state.garden.objects).toHaveLength(2);
    expect(state.garden.message).toContain('Harvest');
    state = reduce(state, { type: 'tool', tool: 'water' });
    state = reduce(state, { type: 'tend', soilId: id });
    state = ripe(state);
    state = reduce(state, { type: 'tool', tool: 'harvest' });
    state = reduce(state, { type: 'tend', soilId: id });
    state = reduce(state, { type: 'select', id: 'piece-2' });
    state = reduce(state, { type: 'remove' });
    expect(state.garden.objects).toHaveLength(1);
    expect(state.growing.basket).toBe(1);
    state = reduce(state, { type: 'tool', tool: 'seed' });
    state = reduce(state, { type: 'tend', soilId: id });
    expect(state.growing.crops).toEqual({});
  });
  it('conserves the harvest from independent permanent and bed soil cells', () => {
    let state = gardenWithBed();
    const ids = [...patchSoils, soilId('piece-2', 0), soilId('piece-2', 1)];
    for (const tool of ['seed', 'water'] as const) {
      state = reduce(state, { type: 'tool', tool });
      for (const id of ids) state = reduce(state, { type: 'tend', soilId: id });
    }
    state = ripe(state);
    state = reduce(state, { type: 'tool', tool: 'harvest' });
    for (const id of ids) state = reduce(state, { type: 'tend', soilId: id });
    expect(state.growing.basket).toBe(4);
    expect(state.growing.crops).toEqual({});
  });
});
