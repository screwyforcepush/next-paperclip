import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';
import { runSimulation } from '../agents/agentManager';
import { analyzeImpact } from './impactAnalysis';
import { generateSummary, updateOverview } from './summaryGenerator';
import { calculateSharePrice } from './sharePriceCalculator';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Add this import
import { llmMetadataFromState, LLMMetadata } from '@/lib/utils/metadataUtils';
import { Logger } from '@/lib/utils/logger'; // Add this import

// Define a type for generator messages
type GeneratorMessage =
  | Message
  | { type: 'kpis'; content: KPI }
  | { role: 'business_cycle'; content: string }
  | { role: 'system'; content: string }
  | { type: 'business_overview'; content: string }
  | { role: 'scenario'; content: string };

function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100; // Avoid division by zero
  }
  return Number(((newValue - oldValue) / Math.abs(oldValue) * 100).toFixed(2));
}
export class BusinessEngine {
  static async *runBusinessCycle(
    gameState: GameState,
    userInput: string
  ): AsyncGenerator<GeneratorMessage, GameState> {
    const simulationMessages: Message[] = [];

    const currentCycle = gameState.currentCycle;
    const currentOverview = gameState.businessOverview || BUSINESS_OVERVIEW;
    const llmMetadata: LLMMetadata = llmMetadataFromState(gameState, { userAdvice: userInput });

    // Add simulation group message with cycleNumber
    const simulationGroupMessage: Message = {
      role: 'simulation_group',
      content: "running simulation",
      cycleNumber: currentCycle, // Assign cycleNumber
    };
    yield simulationGroupMessage;

    Logger.debug('[BusinessEngine] Running business cycle');
    Logger.debug('[BusinessEngine] Current game state:', JSON.stringify(gameState, null, 2));
    Logger.debug('[BusinessEngine] User input:', userInput);

    // Find the most recent summary
    const lastSummary = [...gameState.messages]
      .reverse()
      .find(msg => msg.name === "Simulation Summary");
    Logger.debug('[BusinessEngine] Last summary:', lastSummary);
    Logger.debug('[BusinessEngine] Starting simulation');
    const simulationGenerator = runSimulation(
      gameState.currentSituation, 
      userInput,
      currentOverview,
      llmMetadata
    );

    Logger.debug('[BusinessEngine] Entering simulation loop');
    for await (const message of simulationGenerator) {
      const simulationMessage: Message = {
        ...message,
        cycleNumber: currentCycle, // Assign cycleNumber
      };

      simulationMessages.push(simulationMessage);
      yield simulationMessage;
    }
    Logger.debug('[BusinessEngine] Simulation loop complete');
    Logger.debug('[BusinessEngine] Total simulation messages:', simulationMessages.length);

    // Extract C-suite actions
    const cSuiteActions = simulationMessages
      .filter(msg => ['CTO', 'CFO', 'CMO', 'COO'].includes(msg.name || ''))
      .map(msg => msg.content);

    Logger.debug('[BusinessEngine] Analyzing impact');
    const impactAnalysis = await analyzeImpact(
      gameState.currentSituation, 
      cSuiteActions, 
      llmMetadata,
      currentOverview // Add this line
    );
    Logger.debug('[BusinessEngine] Impact analysis:', impactAnalysis);
    impactAnalysis.role = 'simulation';
    impactAnalysis.cycleNumber = currentCycle
    impactAnalysis.name = 'Outcome';
    yield impactAnalysis;
  

    Logger.debug('[BusinessEngine] Calculating new KPIs');
    const newKPIs = await calculateNewKPIs(gameState, simulationMessages, impactAnalysis.content, llmMetadata);

    // Calculate share price
    Logger.debug('[BusinessEngine] Calculating share price');
    const updatedKPIHistory = [...gameState.kpiHistory, newKPIs];
    const { orders, newSharePrice } = calculateSharePrice(updatedKPIHistory);

    // Add share price to newKPIs
    const newKPIsWithSharePrice: KPI = {
      ...newKPIs,
      sharePrice: newSharePrice,
    };

    // do this after new KPIs are calculated as we are passing in impactAnalysis separately
    simulationMessages.push(impactAnalysis);

    Logger.debug('[BusinessEngine] New KPIs:', JSON.stringify(newKPIsWithSharePrice, null, 2));
    yield { type: 'kpis', content: newKPIsWithSharePrice };

    llmMetadata.metrics.kpis = newKPIsWithSharePrice;
    // Calculate KPI changes as percentages
    const previousKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1] || newKPIsWithSharePrice;
    const kpiChanges = {
      revenue: calculatePercentageChange(previousKPIs.revenue, newKPIsWithSharePrice.revenue),
      profitMargin: calculatePercentageChange(previousKPIs.profitMargin, newKPIsWithSharePrice.profitMargin),
      marketShare: calculatePercentageChange(previousKPIs.marketShare, newKPIsWithSharePrice.marketShare),
      innovationIndex: calculatePercentageChange(previousKPIs.innovationIndex, newKPIsWithSharePrice.innovationIndex),
      clvCacRatio: calculatePercentageChange(previousKPIs.clvCacRatio, newKPIsWithSharePrice.clvCacRatio),
      productionEfficiencyIndex: calculatePercentageChange(previousKPIs.productionEfficiencyIndex, newKPIsWithSharePrice.productionEfficiencyIndex),
      sharePrice: calculatePercentageChange(previousKPIs.sharePrice, newKPIsWithSharePrice.sharePrice),
    };

    Logger.debug('[BusinessEngine] KPI Changes (%):', JSON.stringify(kpiChanges, null, 2));

    llmMetadata.metrics.kpiChange = kpiChanges
    //create kpi change array

    // Update business overview
    const updatedOverview = await updateOverview(currentOverview, impactAnalysis.content, llmMetadata);
    Logger.debug('[BusinessEngine] Updated overview:', updatedOverview);
    yield { type: 'business_overview', content: updatedOverview };


    // Generate summary of simulation
    Logger.debug('[BusinessEngine] Generating summary of simulation');
    const simplifiedMessages = simulationMessages.map(msg => `${msg.name || msg.role}: ${msg.content}`);
    const summary = await generateSummary(gameState.currentSituation, userInput, simplifiedMessages, orders, llmMetadata);
    Logger.debug('[BusinessEngine] Simulation summary:', summary);

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
    Logger.debug(`[BusinessEngine] New cycle: ${newCycle}`);
    const businessCycleMessage: Message = {
      role: 'business_cycle',
      content: newCycle.toString(),
      cycleNumber: newCycle, // Assign cycleNumber
    };
    simulationMessages.push(businessCycleMessage);
    yield businessCycleMessage;

    llmMetadata.cycle = newCycle;
    llmMetadata.metrics.userAdvice = undefined;
    llmMetadata.metrics.kpiChange = undefined
    llmMetadata.metrics.scenario = undefined
    
    Logger.debug('[BusinessEngine] Generating new scenario and advice request');
    let newScenario: string;
    let adviceRequest: string;
    try {
      const { scenario, advice_request } = await generateScenario(updatedOverview, llmMetadata, newCycle.toString(), gameState.currentSituation);
      newScenario = scenario;
      adviceRequest = advice_request;
      Logger.debug('[BusinessEngine] New scenario:', newScenario);
      Logger.debug('[BusinessEngine] Advice request:', adviceRequest);
    } catch (error) {
      Logger.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
      adviceRequest = "No advice requested due to an error.";
    }

    // Add system message with new scenario
    const systemMessage: Message = {
      role: 'scenario',
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