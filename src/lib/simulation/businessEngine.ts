import { GameState, Message } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';

export class BusinessEngine {
  static async *runBusinessCycle(gameState: GameState, userInput: string): AsyncGenerator<Message, GameState> {
    console.log('[BusinessEngine] Running business cycle');


    console.log('[BusinessEngine] Starting simulation');
    const simulationGenerator = runSimulation(gameState.currentSituation, userInput);
    const simulationMessages: Message[] = [];

    for await (const message of simulationGenerator) {
      console.log('[BusinessEngine] Received message from simulation:', JSON.stringify(message, null, 2));
      simulationMessages.push(message as Message);
      console.log('[BusinessEngine] Yielding message from simulation');
      yield message as Message;
    }

    console.log('[BusinessEngine] Simulation complete, calculating new KPIs');
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs = calculateNewKPIs(currentKPIs, simulationMessages);
    console.log('[BusinessEngine] Generated new KPIs:', newKPIs);

    const newCycle = gameState.currentCycle + 1;
    console.log(`[BusinessEngine] New cycle: ${newCycle}`);

    let newScenario: string;
    try {
      newScenario = await generateScenario({
        ...gameState,
        currentCycle: newCycle,
      });
      console.log('[BusinessEngine] Generated new scenario:', newScenario);
    } catch (error) {
      console.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
    }

    console.log('[BusinessEngine] Yielding business cycle message');
    yield { role: 'business_cycle', content: newCycle.toString() };
    console.log('[BusinessEngine] Yielding system message with new scenario');
    yield { role: 'system', content: newScenario };


    const updatedGameState: GameState = {
      ...gameState,
      currentCycle: newCycle,
      kpiHistory: [...gameState.kpiHistory, newKPIs],
      messages: [...gameState.messages, ...simulationMessages],
      currentSituation: newScenario,
    };

    console.log('[BusinessEngine] Updated game state:', JSON.stringify(updatedGameState, null, 2));
    return updatedGameState;
  }
}
