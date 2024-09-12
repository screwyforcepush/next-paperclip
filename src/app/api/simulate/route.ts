import { NextRequest } from 'next/server';
import { BusinessEngine } from '@/lib/simulation/businessEngine';

export async function POST(req: NextRequest) {
  console.log("[simulate] Received simulation request");

  const { userInput, gameState: clientGameState } = await req.json();
  console.log("[simulate] User input:", userInput);
  console.log("[simulate] Received game state from client:", JSON.stringify(clientGameState, null, 2));

  if (!clientGameState) {
    console.log("[simulate] No active game found, returning error");
    return new Response(JSON.stringify({ error: 'No active game found' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log("[simulate] Running business cycle simulation");
        let updatedGameState;
        for await (const message of BusinessEngine.runBusinessCycle(clientGameState, userInput)) {
          console.log("[simulate] Received message from BusinessEngine:", JSON.stringify(message, null, 2));
          controller.enqueue(JSON.stringify(message) + '\n');
          if (message.role === 'business_cycle') {
            updatedGameState = message.content;
          }
        }
        console.log("[simulate] Business cycle simulation complete");
        console.log("[simulate] Sending final game state");
        controller.enqueue(JSON.stringify({ type: 'gameState', content: updatedGameState }) + '\n');
        controller.close();
      } catch (error) {
        console.error("[simulate] Error in simulation:", error);
        controller.error(error);
      }
    }
  });

  console.log("[simulate] Returning stream response");
  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  });
}
