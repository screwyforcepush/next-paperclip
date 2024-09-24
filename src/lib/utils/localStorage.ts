import { GameState } from '@/types/game';

const GAME_STATE_KEY = 'universalPaperclips_gameState';

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  const savedState = localStorage.getItem(GAME_STATE_KEY);
  if (savedState) {
    console.log('[localStorage] Loaded game state from local storage:', savedState);
    return JSON.parse(savedState);
  } else {
    console.log('[localStorage] No saved game state found in local storage');
    return null;
  }
}

export function saveGameState(gameState: GameState): void {
  if (typeof window !== 'undefined') {
    const stateToSave = JSON.stringify(gameState);
    localStorage.setItem(GAME_STATE_KEY, stateToSave);
    console.log('[localStorage] Saved game state to local storage');
  }
}

export function getGameState(): GameState | null {
  return loadGameState();
}

export function setGameState(state: GameState): void {
  saveGameState(state);
}

export function clearGameState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GAME_STATE_KEY);
    console.log('[localStorage] Cleared game state from local storage');
  }
}
