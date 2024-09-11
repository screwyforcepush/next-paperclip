import { saveGameState } from './localStorage';
import { GameState } from '@/types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function startNewGame(): Promise<GameState> {
  console.log('[api] Starting new game');
  try {
    const response = await fetch(`${API_BASE_URL}/api/newGame`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[api] Failed to start new game:', response.status, errorText);
      throw new Error(`Failed to start a new game: ${response.status} ${errorText}`);
    }
    const newGameState: GameState = await response.json();
    console.log('[api] New game state:', JSON.stringify(newGameState, null, 2));
    saveGameState(newGameState);
    return newGameState;
  } catch (error) {
    console.error('[api] Error in startNewGame:', error);
    throw error;
  }
}

export async function simulateBusinessCycle(userAdvice: string) {
  console.log('[api] Simulating business cycle with advice:', userAdvice);
  try {
    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAdvice }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[api] Simulation failed:', response.status, errorText);
      throw new Error(`Failed to simulate business cycle: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[api] Simulation result:', JSON.stringify(result, null, 2));
    saveGameState(result.gameState);
    return result;
  } catch (error) {
    console.error('[api] Error in simulateBusinessCycle:', error);
    throw error;
  }
}

export async function generateScenario() {
  const response = await fetch('/api/generateScenario');
  return response.json();
}

export async function saveGame(gameState: GameState) {
  const response = await fetch('/api/saveGame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState),
  });
  return response.json();
}