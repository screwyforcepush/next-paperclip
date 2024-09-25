import { GameState } from '@/types/game';

const GAME_STATE_KEY = 'universalPaperclips_gameState';

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (isValidGameState(parsedState)) {
        console.log('[localStorage] Loaded game state from local storage:', parsedState);
        return parsedState;
      } else {
        console.error('[localStorage] Invalid game state found in local storage');
        return null;
      }
    } else {
      console.log('[localStorage] No saved game state found in local storage');
      return null;
    }
  } catch (error) {
    console.error('[localStorage] Error loading game state:', error);
    return null;
  }
}

function isValidGameState(state: any): state is GameState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.currentCycle === 'number' &&
    typeof state.currentSituation === 'string' &&
    Array.isArray(state.kpiHistory) &&
    Array.isArray(state.messages)
  );
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
