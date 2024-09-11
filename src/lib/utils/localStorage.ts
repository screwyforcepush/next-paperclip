import { GameState } from '@/types/game';

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  const savedState = localStorage.getItem('gameState');
  return savedState ? JSON.parse(savedState) : null;
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gameState', JSON.stringify(state));
}

export function getGameState(): GameState | null {
  return loadGameState();
}

export function setGameState(state: GameState): void {
  saveGameState(state);
}
