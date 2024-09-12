import { NextRequest, NextResponse } from 'next/server';
import { BusinessEngine } from '@/lib/simulation/businessEngine';

export async function POST(req: NextRequest) {
  console.log("[simulate] Received simulation request");

  try {
    const { userInput, gameState: clientGameState } = await req.json();
    console.log("[simulate] User input:", userInput);
    console.log("[simulate] Received game state from client:", clientGameState);

    if (!clientGameState) {
      console.log("[simulate] No active game found, returning error");
      return NextResponse.json({ error: 'No active game found' }, { status: 400 });
    }

    console.log("[simulate] Running business cycle simulation");
    const { messages, updatedGameState } = await BusinessEngine.runBusinessCycle(clientGameState, userInput);
    
    console.log("[simulate] Simulation completed. Updated game state:", updatedGameState);
    console.log("[simulate] New messages:", messages);

    return NextResponse.json({ success: true, messages, gameState: updatedGameState });
  } catch (error: unknown) {
    console.error("[simulate] Error in simulation:", error);
    if (error instanceof Error) {
      console.error("[simulate] Error stack:", error.stack);
      return NextResponse.json({ 
        success: false, 
        error: "Simulation failed", 
        details: error.message, 
        stack: error.stack 
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Simulation failed", 
        details: "An unknown error occurred" 
      }, { status: 500 });
    }
  }
}
