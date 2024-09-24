import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';
import { analyzeImpact } from './impactAnalysis';

// Define a type for generator messages
type GeneratorMessage =
  | Message
  | { type: 'kpis'; content: KPI }
  | { role: 'business_cycle'; content: string }
  | { role: 'system'; content: string };

export class BusinessEngine {
  static async *runBusinessCycle(
    gameState: GameState,
    userInput: string
  ): AsyncGenerator<GeneratorMessage, GameState> {
    const simulationMessages: Message[] = [];

    const currentCycle = gameState.currentCycle;

    // Add simulation group message with cycleNumber
    const simulationGroupMessage: Message = {
      role: 'simulation_group',
      content: "running simulation",
      cycleNumber: currentCycle, // Assign cycleNumber
    };
    simulationMessages.push(simulationGroupMessage);
    yield simulationGroupMessage;

    console.log('[BusinessEngine] Running business cycle');
    console.log('[BusinessEngine] Current game state:', JSON.stringify(gameState, null, 2));
    console.log('[BusinessEngine] User input:', userInput);

    console.log('[BusinessEngine] Starting simulation');
    const simulationGenerator = runSimulation(gameState.currentSituation, userInput);

    console.log('[BusinessEngine] Entering simulation loop');
    for await (const message of simulationGenerator) {
      const simulationMessage: Message = {
        ...message,
        cycleNumber: currentCycle, // Assign cycleNumber
      };

      simulationMessages.push(simulationMessage);
      yield simulationMessage;
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
    impactAnalysis.role = 'system';
    yield impactAnalysis;
    simulationMessages.push(impactAnalysis);

    console.log('[BusinessEngine] Calculating new KPIs');
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs = await calculateNewKPIs(currentKPIs, impactAnalysis.content);
    console.log('[BusinessEngine] New KPIs:', JSON.stringify(newKPIs, null, 2));
    yield { type: 'kpis', content: newKPIs };


    // Add business cycle message

    const newCycle = gameState.currentCycle + 1; // Calculate the new cycle number
    console.log(`[BusinessEngine] New cycle: ${newCycle}`);
    const businessCycleMessage: Message = {
      role: 'business_cycle',
      content: newCycle.toString(),
      cycleNumber: newCycle, // Assign cycleNumber
    };
    simulationMessages.push(businessCycleMessage);
    yield businessCycleMessage;


    console.log('[BusinessEngine] Generating new scenario');
    let newScenario: string;
    try {
      newScenario = await generateScenario(impactAnalysis.content);
      console.log('[BusinessEngine] New scenario:', newScenario);
    } catch (error) {
      console.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
    }

    
    // Add system message with new scenario
    const systemMessage: Message = {
      role: 'system',
      content: newScenario,
      cycleNumber: newCycle, // Assign cycleNumber
    };
    simulationMessages.push(systemMessage);
    yield systemMessage;

    return gameState; // Return the updated game state
  }
}
