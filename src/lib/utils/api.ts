import { saveGameState, clearGameState } from './localStorage';
import { GameState } from '@/types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function startNewGame(): Promise<GameState> {
  console.log('[api] Starting new game');
  try {
    clearGameState();

    // Use NEXT_PUBLIC_API_BASE_URL for client-side code
    const response = await fetch(`${API_BASE_URL}/api/generateScenario`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const { scenario, advice_request } = await response.json();
    
    // Ensure scenario and advice_request are strings
    const scenarioContent = typeof scenario === 'string' ? scenario : JSON.stringify(scenario);
    const adviceRequestContent = typeof advice_request === 'string' ? advice_request : JSON.stringify(advice_request);

    const newGameState: GameState = {
      currentCycle: 1,
      currentSituation: scenarioContent,
      kpiHistory: [{
        revenue: 1000000,
        profitMargin: 0.1,
        clvCacRatio: 2.0,
        productionEfficiencyIndex: 0.7,
        marketShare: 0.05,
        innovationIndex: 0.6,
        sharePrice: 20
      }],
      messages: [
        { role: 'system', content: "catface Welcome to Universal Paperclips! Let's start your journey as a business consultant." },
        { role: 'business_cycle', content: '1', cycleNumber: 1 },
        { role: 'system', content: scenarioContent, cycleNumber: 1 },
        { role: 'system', name: 'CEO', content: adviceRequestContent, cycleNumber: 1 },
      ],
    };

    console.log('[api] New game state:', JSON.stringify(newGameState, null, 2));
    saveGameState(newGameState);
    return newGameState;
  } catch (error) {
    console.error('[api] Error in startNewGame:', error);
    throw error;
  }
}

export const simulateBusinessCycle = async (userInput: string, gameState: GameState): Promise<{
  gameState: GameState;
}> => {
  console.log('[api] Simulating business cycle with user input:', userInput);
  console.log('[api] Current game state:', gameState);
  
  try {
    console.log('[api] Sending simulation request to server');
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput, gameState }),
    });

    if (!response.ok) {
      throw new Error(`Failed to simulate business cycle: ${response.status}`);
    }

    const { gameState: updatedGameState } = await response.json();
    console.log('[api] Received updated game state from server:', updatedGameState);
    return { gameState: updatedGameState };
  } catch (error) {
    console.error('[api] Error in simulateBusinessCycle:', error);
    throw error;
  }
};

export async function saveGame(gameState: GameState) {
  console.log('[api] Saving game state:', gameState);
  const response = await fetch('/api/saveGame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState),
  });
  return response.json();
}