import { NextRequest, NextResponse } from 'next/server';
import { BusinessEngine } from '@/lib/simulation/businessEngine';

export async function POST(req: NextRequest) {
  console.log("[simulate] Received simulation request");

  const { userInput, gameState: clientGameState } = await req.json();
  console.log("[simulate] User input:", userInput);
  console.log("[simulate] Received game state from client:", clientGameState);

  // Use the game state sent from the client instead of trying to retrieve it on the server
  const gameState = clientGameState;

  if (!gameState) {
    console.log("[simulate] No active game found, returning error");
    return NextResponse.json({ error: 'No active game found' }, { status: 400 });
  }

  try {
    console.log("[simulate] Running business cycle simulation");
    const { messages, updatedGameState } = await BusinessEngine.runBusinessCycle(gameState, userInput);
    
    console.log("[simulate] Simulation completed. Updated game state:", updatedGameState);
    console.log("[simulate] New messages:", messages);

    return NextResponse.json({ success: true, messages, gameState: updatedGameState });
  } catch (error) {
    console.error("[simulate] Error in simulation:", error);
    return NextResponse.json({ success: false, error: "Simulation failed" }, { status: 500 });
  }
}
