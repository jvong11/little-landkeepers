import { buildingReducer, createBuildingState, type BuildingAction, type BuildingState } from './building';
import { createGrowingState, growCrops, hasCrops, soilIds, tendSoil, type GardenTool, type GrowingState } from './growing';
export interface GameState { garden: BuildingState; growing: GrowingState; tool: GardenTool }
export type GameAction = BuildingAction | { type: 'tool'; tool: GardenTool } | { type: 'tend'; soilId: string } | { type: 'grow'; elapsed: number };
export function createGameState(): GameState { return { garden: createBuildingState(), growing: createGrowingState(), tool: 'build' }; }
export function gardenReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'grow') {
    const growing = growCrops(state.growing, action.elapsed);
    return growing === state.growing ? state : { ...state, growing };
  }
  const homeBuilt = state.garden.objects.some((o) => o.kind === 'home');
  if (action.type === 'tool') {
    if (action.tool !== 'build' && !homeBuilt) return state;
    return { ...state, tool: action.tool, garden: buildingReducer(state.garden, { type: 'cancel' }), growing: { ...state.growing, message: action.tool === 'seed' ? 'Tap an empty soil space to plant one seed.' : action.tool === 'water' ? 'Tap a planted seed to give it water.' : action.tool === 'harvest' ? 'Tap an orange, ripe carrot to put it in your basket.' : state.growing.message } };
  }
  if (action.type === 'tend') {
    if (!homeBuilt) return state;
    return { ...state, growing: tendSoil(state.growing, action.soilId, state.tool, soilIds(state.garden.objects)) };
  }
  const removedId = action.type === 'remove' ? state.garden.draft?.movingId
    : action.type === 'undo' && !state.garden.lastMove ? state.garden.lastPlacementId : null;
  if (removedId && hasCrops(state.growing, removedId)) {
    return { ...state, garden: { ...state.garden, message: 'This bed has plants. Harvest them before returning it to the tray.' } };
  }
  const garden = buildingReducer(state.garden, action);
  return { ...state, garden, tool: ['choose', 'select', 'inspect'].includes(action.type) ? 'build' : state.tool };
}
