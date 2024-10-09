import { v4 as uuidv4 } from 'uuid';
import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';
import { analyzeImpact } from './impactAnalysis';
import { generateSummary, updateOverview } from './summaryGenerator';
import { calculateSharePrice } from './sharePriceCalculator';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Add this import
import { llmMetadataFromState } from '@/lib/utils/metadataUtils';

// Define a type for generator messages
type GeneratorMessage =
  | Message
  | { type: 'kpis'; content: KPI }
  | { role: 'business_cycle'; content: string }
  | { role: 'system'; content: string }
  | { type: 'business_overview'; content: string };

export class BusinessEngine {
  static async *runBusinessCycle(
    gameState: GameState,
    userInput: string
  ): AsyncGenerator<GeneratorMessage, GameState> {
    const simulationMessages: Message[] = [];

    const currentCycle = gameState.currentCycle;
    const currentOverview = gameState.businessOverview || BUSINESS_OVERVIEW;
    const llmMetadata = llmMetadataFromState(gameState);

    // Add simulation group message with cycleNumber
    const simulationGroupMessage: Message = {
      role: 'simulation_group',
      content: "running simulation",
      cycleNumber: currentCycle, // Assign cycleNumber
    };
    yield simulationGroupMessage;

    console.log('[BusinessEngine] Running business cycle');
    console.log('[BusinessEngine] Current game state:', JSON.stringify(gameState, null, 2));
    console.log('[BusinessEngine] User input:', userInput);

    // Find the most recent summary
    const lastSummary = [...gameState.messages]
      .reverse()
      .find(msg => msg.name === "Simulation Summary");
    console.log('[BusinessEngine] Last summary:', lastSummary);
    console.log('[BusinessEngine] Starting simulation');
    const simulationGenerator = runSimulation(
      gameState.currentSituation, 
      userInput,
      currentOverview,
      llmMetadata
    );

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
    const impactAnalysis = await analyzeImpact(
      gameState.currentSituation, 
      cSuiteActions, 
      llmMetadata,
      currentOverview // Add this line
    );
    console.log('[BusinessEngine] Impact analysis:', impactAnalysis);
    impactAnalysis.role = 'simulation';
    impactAnalysis.cycleNumber = currentCycle
    impactAnalysis.name = 'Outcome';
    yield impactAnalysis;
  

    console.log('[BusinessEngine] Calculating new KPIs');
    const newKPIs = await calculateNewKPIs(gameState, simulationMessages, impactAnalysis.content, llmMetadata);

    // Calculate share price
    console.log('[BusinessEngine] Calculating share price');
    const updatedKPIHistory = [...gameState.kpiHistory, newKPIs];
    const { orders, newSharePrice } = calculateSharePrice(updatedKPIHistory);

    // Add share price to newKPIs
    const newKPIsWithSharePrice: KPI = {
      ...newKPIs,
      sharePrice: newSharePrice,
    };

    // do this after new KPIs are calculated as we are passing in impactAnalysis separately
    simulationMessages.push(impactAnalysis);

    console.log('[BusinessEngine] New KPIs:', JSON.stringify(newKPIsWithSharePrice, null, 2));
    yield { type: 'kpis', content: newKPIsWithSharePrice };

    llmMetadata.kpis = newKPIsWithSharePrice;
    // Update business overview
    const updatedOverview = await updateOverview(currentOverview, impactAnalysis.content, llmMetadata);
    console.log('[BusinessEngine] Updated overview:', updatedOverview);
    yield { type: 'business_overview', content: updatedOverview };


    // Generate summary of simulation
    console.log('[BusinessEngine] Generating summary of simulation');
    const simplifiedMessages = simulationMessages.map(msg => `${msg.name || msg.role}: ${msg.content}`);
    const summary = await generateSummary(gameState.currentSituation, userInput, simplifiedMessages, orders, llmMetadata);
    console.log('[BusinessEngine] Simulation summary:', summary);

    // Add system message with summary
    const summaryMessage: Message = {
      role: 'system',
      content: summary,
      name: 'Simulation Summary', // Fixed typo here
      cycleNumber: currentCycle, // Assign cycleNumber
    };
    yield summaryMessage;
    simulationMessages.push(summaryMessage);

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

    llmMetadata.cycle = newCycle;
    console.log('[BusinessEngine] Generating new scenario and advice request');
    let newScenario: string;
    let adviceRequest: string;
    try {
      const { scenario, advice_request } = await generateScenario(updatedOverview, llmMetadata);
      newScenario = scenario;
      adviceRequest = advice_request;
      console.log('[BusinessEngine] New scenario:', newScenario);
      console.log('[BusinessEngine] Advice request:', adviceRequest);
    } catch (error) {
      console.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
      adviceRequest = "No advice requested due to an error.";
    }

    // Add system message with new scenario
    const systemMessage: Message = {
      role: 'system',
      content: newScenario,
      cycleNumber: newCycle, // Assign cycleNumber
    };
    simulationMessages.push(systemMessage);
    yield systemMessage;

    // Add advice request message
    const adviceMessage: Message = {
      role: 'system',
      content: adviceRequest,
      name: 'CEO',
      cycleNumber: newCycle, // Assign cycleNumber
    };
    simulationMessages.push(adviceMessage);
    yield adviceMessage;

    return {
      ...gameState,
      currentCycle: newCycle,
      currentSituation: newScenario,
      kpiHistory: [...gameState.kpiHistory, newKPIsWithSharePrice],
      messages: [...gameState.messages, ...simulationMessages],
    };
  }
}