import { create } from 'zustand';
import { buildingReducer, createBuildingState, type BuildingAction, type BuildingState } from './building';
interface BuildingStore { garden: BuildingState; dispatch: (action: BuildingAction) => void }
export const useBuildingStore = create<BuildingStore>((set) => ({
  garden: createBuildingState(),
  dispatch: (action) => set((state) => ({ garden: buildingReducer(state.garden, action) })),
}));
