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
        console.log("[simulate] Starting business cycle simulation");
        let messageCount = 0;
        for await (const message of BusinessEngine.runBusinessCycle(clientGameState, userInput)) {

          if (message.type === 'kpis') {
            console.log("[simulate] Received KPIs:", JSON.stringify(message.content, null, 2));
            controller.enqueue(JSON.stringify(message) + '\n');
            console.log("[simulate] Enqueued KPI update to stream");
          }
          else {
            messageCount++;
            console.log(`[simulate] Received message ${messageCount} from BusinessEngine:`, JSON.stringify(message, null, 2));
            controller.enqueue(JSON.stringify(message) + '\n');
            console.log(`[simulate] Enqueued message ${messageCount} to stream`);
          }
        }
        console.log("[simulate] Business cycle simulation complete");
        console.log(`[simulate] Total messages processed: ${messageCount}`);
        
        controller.close();
        console.log("[simulate] Stream closed");
      } catch (error) {
        console.error("[simulate] Error in simulation:", error);
        controller.error(error);
      }
    }
  });

  return new Response(stream);
}
