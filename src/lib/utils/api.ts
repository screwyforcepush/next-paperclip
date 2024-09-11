import { saveGameState } from './localStorage';
import { GameState } from '@/types/game';
import { generateScenario } from '../simulation/scenarioGenerator';
import { Message } from '@/types/game';

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
    
    // Generate initial scenario
    const initialScenario = await generateScenario();
    
    // Add the scenario to the game state
    newGameState.messages = [
      { role: 'system', content: initialScenario },
      ...newGameState.messages
    ];

    console.log('[api] New game state:', JSON.stringify(newGameState, null, 2));
    saveGameState(newGameState);
    return newGameState;
  } catch (error) {
    console.error('[api] Error in startNewGame:', error);
    throw error;
  }
}

export const simulateBusinessCycle = async (userInput: string): Promise<Message[]> => {
  // Implement the business cycle simulation logic here
  // Return an array of Message objects
  // Example:
  return [
    { role: 'assistant', content: 'Simulating business cycle...' },
    { role: 'assistant', content: 'Results of the simulation based on your input.' },
  ];
};

export async function saveGame(gameState: GameState) {
  const response = await fetch('/api/saveGame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState),
  });
  return response.json();
}