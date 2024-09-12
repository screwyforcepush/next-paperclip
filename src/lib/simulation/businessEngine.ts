import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';

export class BusinessEngine {
  static async runBusinessCycle(gameState: GameState, userInput: string): Promise<{
    messages: Message[];
    updatedGameState: GameState;
  }> {
    console.log('[BusinessEngine] Running business cycle');
    


    // Run the AI agent simulation
    const simulationResult = await runSimulation(gameState.currentSituation, userInput);
    console.log('[BusinessEngine] Simulation result:', simulationResult);

    // Extract messages from the simulation result
    const simulationMessages = simulationResult.messages.map((msg: any) => ({
      role: msg.type === 'human' ? 'user' : 'assistant',
      content: msg.data.content,
    }));

    // Calculate new KPIs based on the simulation outcome
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs = calculateNewKPIs(currentKPIs, simulationResult);
    console.log('[BusinessEngine] Generated new KPIs:', newKPIs);

        // Increment the cycle
    const newCycle = gameState.currentCycle + 1;
    console.log(`[BusinessEngine] New cycle: ${newCycle}`);

    // Generate new scenario
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

    const messages: Message[] = [
      { role: 'business_cycle', content: newCycle.toString() },
      { role: 'system', content: newScenario },
      ...simulationMessages,
    ];

    const updatedGameState: GameState = {
      ...gameState,
      currentCycle: newCycle,
      kpiHistory: [...gameState.kpiHistory, newKPIs],
      messages: [...gameState.messages, ...messages],
    };

    console.log('[BusinessEngine] Updated game state:', updatedGameState);
    console.log('[BusinessEngine] Returning messages and updated game state');

    return { messages, updatedGameState };
  }
}
