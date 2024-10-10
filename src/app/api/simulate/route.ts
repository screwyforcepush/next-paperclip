import { NextRequest } from 'next/server';
import { BusinessEngine } from '@/lib/simulation/businessEngine';
import { Logger } from '@/lib/utils/logger';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  Logger.info("[simulate] Received simulation request");

  const { userInput, gameState: clientGameState } = await req.json();
  Logger.debug("[simulate] User input:", userInput);
  Logger.debug("[simulate] Received game state from client:", JSON.stringify(clientGameState, null, 2));

  if (!clientGameState) {
    Logger.warn("[simulate] No active game found, returning error");
    return new Response(JSON.stringify({ error: 'No active game found' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        Logger.info("[simulate] Starting business cycle simulation");
        let messageCount = 0;
        for await (const message of BusinessEngine.runBusinessCycle(clientGameState, userInput)) {
          if ('type' in message && message.type === 'kpis') {
            Logger.debug("[simulate] Received KPIs:", JSON.stringify(message.content, null, 2));
            controller.enqueue(JSON.stringify(message) + '\n');
            Logger.debug("[simulate] Enqueued KPI update to stream");
          } else if ('type' in message && message.type === 'business_overview') {
            Logger.debug("[simulate] Received overview update:", message.content);
            controller.enqueue(JSON.stringify(message) + '\n');
            Logger.debug("[simulate] Enqueued overview update to stream");
          } else {
            messageCount++;
            Logger.debug(`[simulate] Received message ${messageCount} from BusinessEngine:`, JSON.stringify(message, null, 2));
            controller.enqueue(JSON.stringify(message) + '\n');
            Logger.debug(`[simulate] Enqueued message ${messageCount} to stream`);
          }
        }
        Logger.info("[simulate] Business cycle simulation complete");
        Logger.info(`[simulate] Total messages processed: ${messageCount}`);
        
        controller.close();
        Logger.debug("[simulate] Stream closed");
      } catch (error) {
        Logger.error("[simulate] Error in simulation:", error);
        controller.error(error);
      }
    }
  });

  return new Response(stream);
}
