import { v4 as uuidv4 } from 'uuid';
import { GameState } from '@/types/game';

export function llmMetadataFromState(gameState: GameState) {
  return {
    gameId: gameState.gameId,
    sessionId: gameState.sessionId,
    userId: gameState.userId,
    cycle: gameState.currentCycle,
    kpis: gameState.kpiHistory[gameState.kpiHistory.length - 1] || {},
    trace_id: uuidv4()
  };
}