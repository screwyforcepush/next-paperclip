import { NextRequest, NextResponse } from 'next/server';
import { BusinessEngine } from '@/lib/simulation/businessEngine';
import { getGameState, saveGameState } from '@/lib/utils/localStorage';
import { generateScenario } from '@/lib/simulation/scenarioGenerator';
import { GameState } from '@/types/game';

export async function POST(req: NextRequest) {
  console.log("[simulate] Received simulation request");

  const { userAdvice } = await req.json();
  console.log("[simulate] User advice:", userAdvice);

  let gameState = getGameState();
  console.log("[simulate] Current game state:", gameState);

  if (!gameState) {
    console.log("[simulate] No active game found, initializing a new game");
    gameState = await initializeNewGame();
  }

  try {
    const result = await BusinessEngine.runBusinessCycle(gameState.currentSituation, userAdvice);
    
    // Update game state with new information
    gameState.currentCycle += 1;
    gameState.kpiHistory.push(result.updatedKPIs);
    gameState.messages = gameState.messages.concat(result.agentResponses);
    
    // Generate new situation for the next cycle
    gameState.currentSituation = await generateScenario(gameState);

    saveGameState(gameState);

    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    console.error("[simulate] Error in simulation:", error);
    return NextResponse.json({ success: false, error: "Simulation failed" }, { status: 500 });
  }
}

async function initializeNewGame(): Promise<GameState> {
  console.log("[api] Starting new game");
  const initialScenario = await generateScenario();
  const initialState: GameState = {
    currentCycle: 1,
    currentSituation: initialScenario,
    kpiHistory: [
      {
        revenue: 1000000,
        profitMargin: 0.1,
        cacClvRatio: 0.5,
        productionEfficiencyIndex: 0.7,
        marketShare: 0.05,
        innovationIndex: 0.6
      }
    ],
    messages: [
      {
        id: "1",
        sender: "System",
        content: "Welcome to Universal Paperclips! Let's start your journey as a business consultant.",
        type: "system"
      },
      {
        id: "2",
        sender: "System",
        content: initialScenario,
        type: "system"
      }
    ]
  };

  saveGameState(initialState);
  console.log("[api] New game state:", initialState);
  return initialState;
}
