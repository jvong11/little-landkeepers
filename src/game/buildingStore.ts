import { create } from 'zustand';
import { createGameState, gardenReducer, type GameAction, type GameState } from './garden';
interface BuildingStore extends GameState { dispatch: (action: GameAction) => void }
export const useBuildingStore = create<BuildingStore>((set) => ({
  ...createGameState(),
  dispatch: (action) => set((state) => gardenReducer(state, action)),
}));
