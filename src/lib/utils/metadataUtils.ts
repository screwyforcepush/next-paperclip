import { GameState } from '@/types/game';

let cryptoUtil: { randomUUID: () => string };

if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
  // For environments that support crypto.randomUUID (including Edge Runtime)
  cryptoUtil = crypto;
} else {
  // Fallback for Node.js environments
  const { v4: uuidv4 } = require('uuid');
  cryptoUtil = {
    randomUUID: uuidv4
  };
}

export function generateUUID(): string {
  return cryptoUtil.randomUUID();
}

export function llmMetadataFromState(gameState: GameState) {
  return {
    gameId: gameState.gameId,
    sessionId: gameState.sessionId,
    userId: gameState.userId,
    cycle: gameState.currentCycle,
    kpis: gameState.kpiHistory[gameState.kpiHistory.length - 1] || {},
    trace_id: generateUUID()
  };
}