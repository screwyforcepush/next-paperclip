import { GameState, KPI } from '@/types/game';

// Add this type definition
export type LLMMetadata = {
  gameId: string;
  sessionId: string;
  userId: string;
  cycle: number;
  metrics: {
    kpis: KPI;
    scenario?: string;
    kpiChange?: { [key: string]: number };
    [key: string]: any;  // Allow for additional properties
  };
  trace_id: string;
};

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

export function llmMetadataFromState(gameState: GameState, metrics: Record<string, any> = {}): LLMMetadata {
  return {
    gameId: gameState.gameId,
    sessionId: gameState.sessionId,
    userId: gameState.userId,
    cycle: gameState.currentCycle,
    metrics: {
      ...metrics,
      kpis: gameState.kpiHistory[gameState.kpiHistory.length - 1] || {},
      scenario: gameState.currentSituation
    },
    trace_id: generateUUID()
  };
}