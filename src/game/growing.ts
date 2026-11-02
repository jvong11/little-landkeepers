import { growing as growingPatch, type GardenObject } from './building';

export type GardenTool = 'build' | 'seed' | 'water' | 'harvest';
export type Crop = { stage: 'seed' } | { stage: 'growing'; remaining: number } | { stage: 'ripe' };
export interface GrowingState { crops: Record<string, Crop>; basket: number; message: string }
export const GROW_TIME = 6000;
export const PATCH_ID = 'growing-patch';
export const soilId = (bedId: string, slot: number) => `${bedId}:${slot}`;
export const patchSoils = growingPatch.map((_, i) => soilId(PATCH_ID, i));
export function soilIds(objects: GardenObject[]): string[] {
  return [...patchSoils, ...objects.filter((o) => o.kind === 'bed').flatMap((o) => [soilId(o.id, 0), soilId(o.id, 1)])];
}
export function hasCrops(growing: GrowingState, bedId: string): boolean {
  return [0, 1].some((slot) => !!growing.crops[soilId(bedId, slot)]);
}
export function createGrowingState(): GrowingState { return { crops: {}, basket: 0, message: 'Let’s grow carrots for Pip!' }; }
export function tendSoil(state: GrowingState, id: string, tool: GardenTool, validSoils: string[]): GrowingState {
  if (!validSoils.includes(id) || tool === 'build') return state;
  const crop = state.crops[id];
  if (tool === 'seed') {
    if (crop) return { ...state, message: 'Something is already planted here. Try an empty soil space.' };
    return { ...state, crops: { ...state.crops, [id]: { stage: 'seed' } }, message: 'One seed planted! Choose Water and give it a drink.' };
  }
  if (tool === 'water') {
    if (!crop) return { ...state, message: 'This soil needs a seed first. Choose Seeds.' };
    if (crop.stage !== 'seed') return { ...state, message: crop.stage === 'ripe' ? 'This carrot is ready! Choose Harvest.' : 'It has enough water. Watch the leaves grow!' };
    return { ...state, crops: { ...state.crops, [id]: { stage: 'growing', remaining: GROW_TIME } }, message: 'Watered! You can plant or build while it grows.' };
  }
  if (!crop || crop.stage !== 'ripe') return { ...state, message: !crop ? 'Plant a seed here first.' : crop.stage === 'seed' ? 'Give this seed some water first.' : 'This carrot is still growing. Look for its orange shoulder when it’s ready.' };
  const crops = { ...state.crops }; delete crops[id];
  return { ...state, crops, basket: state.basket + 1, message: 'One carrot in your basket! This soil is ready for another seed.' };
}
export function growCrops(state: GrowingState, elapsed: number): GrowingState {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return state;
  const step = Math.min(elapsed, 1000);
  let changed = false;
  let ripened = false;
  const crops = Object.fromEntries(Object.entries(state.crops).map(([id, crop]) => {
    if (crop.stage !== 'growing') return [id, crop];
    changed = true;
    const remaining = Math.max(0, crop.remaining - step);
    if (!remaining) ripened = true;
    return [id, remaining ? { stage: 'growing', remaining } : { stage: 'ripe' }];
  })) as Record<string, Crop>;
  return changed ? { ...state, crops, message: ripened ? 'A carrot is ready! Choose Harvest and tap the orange carrot.' : state.message } : state;
}
