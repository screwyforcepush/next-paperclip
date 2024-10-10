import { GameState } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/lib/utils/logger';

const GAME_STATE_KEY = 'universalPaperclips_gameState';

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (isValidGameState(parsedState)) {
        // Generate a new sessionId when loading a saved state
        const refreshedState = {
          ...parsedState,
          sessionId: uuidv4()
        };
        Logger.debug('[localStorage] Loaded game state from local storage:', refreshedState);
        // Save the refreshed state back to localStorage
        saveGameState(refreshedState);
        return refreshedState;
      } else {
        Logger.error('[localStorage] Invalid game state found in local storage');
        return null;
      }
    } else {
      Logger.debug('[localStorage] No saved game state found in local storage');
      return null;
    }
  } catch (error) {
    Logger.error('[localStorage] Error loading game state:', error);
    return null;
  }
}

function isValidGameState(state: any): state is GameState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.userId === 'string' &&
    typeof state.gameId === 'string' &&
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
    Logger.debug('[localStorage] Saved game state to local storage');
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
    Logger.debug('[localStorage] Cleared game state from local storage');
  }
}
