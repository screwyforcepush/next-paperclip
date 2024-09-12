import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';
import { calculateNewKPIs } from './kpiCalculator';

export class BusinessEngine {
  static async runBusinessCycle(gameState: GameState, userInput: string): Promise<{
    messages: Message[];
    updatedGameState: GameState;
  }> {
    console.log('[BusinessEngine] Running business cycle');
    
    // Increment the cycle
    const newCycle = gameState.currentCycle + 1;
    console.log(`[BusinessEngine] New cycle: ${newCycle}`);

    // Analyze user input and determine impact on KPIs
    const inputAnalysis = this.analyzeUserInput(userInput);
    console.log('[BusinessEngine] User input analysis:', inputAnalysis);

    // Generate new KPIs based on current KPIs and user input analysis
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs = calculateNewKPIs(currentKPIs, inputAnalysis);
    console.log('[BusinessEngine] Generated new KPIs:', newKPIs);

    let newScenario: string;
    try {
      newScenario = await generateScenario({
        ...gameState,
        currentCycle: newCycle,
        kpiHistory: [...gameState.kpiHistory, newKPIs]
      });
      console.log('[BusinessEngine] Generated new scenario:', newScenario);
    } catch (error) {
      console.error('[BusinessEngine] Error generating scenario:', error);
      newScenario = "An unexpected issue occurred. The CEO is working to resolve it.";
    }

    const ceoResponse = this.generateCEOResponse(inputAnalysis, newKPIs);
    const messages: Message[] = [
      { role: 'assistant', content: ceoResponse },
      { role: 'business_cycle', content: newCycle.toString() },
      { role: 'system', content: newScenario },
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

  private static analyzeUserInput(input: string): { [key: string]: number } {
    // TODO: Implement more sophisticated analysis, possibly using NLP
    const analysis = {
      revenue: 0,
      profitMargin: 0,
      cacClvRatio: 0,
      productionEfficiencyIndex: 0,
      marketShare: 0,
      innovationIndex: 0,
    };

    if (input.toLowerCase().includes('increase prices')) {
      analysis.revenue += 0.05;
      analysis.profitMargin += 0.03;
      analysis.marketShare -= 0.02;
    }
    if (input.toLowerCase().includes('marketing campaign')) {
      analysis.revenue += 0.03;
      analysis.cacClvRatio -= 0.02;
      analysis.marketShare += 0.02;
    }
    // Add more conditions based on possible user inputs

    return analysis;
  }

  private static generateCEOResponse(inputAnalysis: { [key: string]: number }, newKPIs: KPI): string {
    let response = "Thank you for your advice. Based on your input, we've taken the following actions:\n\n";

    if (inputAnalysis.revenue > 0) {
      response += "- We've implemented strategies to increase our revenue.\n";
    }
    if (inputAnalysis.profitMargin > 0) {
      response += "- We've taken steps to improve our profit margin.\n";
    }
    // Add more conditions based on the input analysis

    response += "\nHere's a summary of our current situation:\n";
    response += `- Revenue: $${newKPIs.revenue.toFixed(2)}\n`;
    response += `- Profit Margin: ${(newKPIs.profitMargin * 100).toFixed(2)}%\n`;
    // Add more KPI summaries

    return response;
  }
}
