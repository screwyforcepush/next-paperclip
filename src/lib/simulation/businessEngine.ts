import { GameState, Message } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';
import { analyzeImpact } from './impactAnalysis';

export class BusinessEngine {
  static async *runBusinessCycle(gameState: GameState, userInput: string): AsyncGenerator<Message | { type: string; content: GameState }, GameState> {
    const simulationMessages: Message[] = [];
    
    // Add simulation group message
    const simulationGroupMessage: Message = { role: 'simulation_group', content: "running simulation" };
    simulationMessages.push(simulationGroupMessage);
    yield simulationGroupMessage;

    console.log('[BusinessEngine] Running business cycle');
    console.log('[BusinessEngine] Current game state:', JSON.stringify(gameState, null, 2));
    console.log('[BusinessEngine] User input:', userInput);

    console.log('[BusinessEngine] Starting simulation');
    const simulationGenerator = runSimulation(gameState.currentSituation, userInput);

    console.log('[BusinessEngine] Entering simulation loop');
    for await (const message of simulationGenerator) {
      simulationMessages.push(message as Message);
      yield message as Message;
    }
    console.log('[BusinessEngine] Simulation loop complete');
    console.log('[BusinessEngine] Total simulation messages:', simulationMessages.length);

    // Extract C-suite actions
    const cSuiteActions = simulationMessages
      .filter(msg => ['CTO', 'CFO', 'CMO', 'COO'].includes(msg.name || ''))
      .map(msg => msg.content);

    console.log('[BusinessEngine] Analyzing impact');
    const impactAnalysis = await analyzeImpact(gameState.currentSituation, cSuiteActions);
    console.log('[BusinessEngine] Impact analysis:', impactAnalysis);
    yield impactAnalysis;
    simulationMessages.push(impactAnalysis);

    console.log('[BusinessEngine] Calculating new KPIs');
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs = await calculateNewKPIs(currentKPIs, impactAnalysis.content);
    console.log('[BusinessEngine] New KPIs:', JSON.stringify(newKPIs, null, 2));

    const newCycle = gameState.currentCycle + 1;
    console.log(`[BusinessEngine] New cycle: ${newCycle}`);

    console.log('[BusinessEngine] Generating new scenario');
    let newScenario: string;
    try {
      newScenario = await generateScenario({
        ...gameState,
        currentCycle: newCycle,
      });
      console.log('[BusinessEngine] New scenario:', newScenario);
    } catch (error) {
      console.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
    }

    // Add business cycle message
    const businessCycleMessage: Message = { role: 'business_cycle', content: newCycle.toString() };
    simulationMessages.push(businessCycleMessage);
    yield businessCycleMessage;

    // Add system message with new scenario
    const systemMessage: Message = { role: 'system', content: newScenario };
    simulationMessages.push(systemMessage);
    yield systemMessage;

    const updatedGameState: GameState = {
      ...gameState,
      currentCycle: newCycle,
      kpiHistory: [...gameState.kpiHistory, newKPIs],
      messages: [...gameState.messages, ...simulationMessages],
      currentSituation: newScenario,
    };

    console.log('[BusinessEngine] Updated game state:', updatedGameState);
    yield { type: 'gameState', content: updatedGameState };
    return updatedGameState;
  }
}
