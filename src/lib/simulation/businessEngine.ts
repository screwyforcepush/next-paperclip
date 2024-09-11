import { GameState, Message, KPI } from '@/types/game';
import { generateScenario } from './scenarioGenerator';

export class BusinessEngine {
  static async runBusinessCycle(gameState: GameState, userInput: string): Promise<{
    messages: Message[];
    updatedGameState: GameState;
  }> {
    console.log('[BusinessEngine] Running business cycle');
    
    // Increment the cycle
    const newCycle = gameState.currentCycle + 1;

    // TODO: Implement actual business logic here
    // For now, we'll just generate new KPIs based on the current ones
    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const newKPIs: KPI = {
      revenue: currentKPIs.revenue * (1 + (Math.random() - 0.5) * 0.2),
      profitMargin: Math.max(0, Math.min(1, currentKPIs.profitMargin + (Math.random() - 0.5) * 0.05)),
      cacClvRatio: Math.max(0, currentKPIs.cacClvRatio + (Math.random() - 0.5) * 0.1),
      productionEfficiencyIndex: Math.max(0, Math.min(1, currentKPIs.productionEfficiencyIndex + (Math.random() - 0.5) * 0.05)),
      marketShare: Math.max(0, Math.min(1, currentKPIs.marketShare + (Math.random() - 0.5) * 0.02)),
      innovationIndex: Math.max(0, Math.min(1, currentKPIs.innovationIndex + (Math.random() - 0.5) * 0.05))
    };

    const newScenario = await generateScenario({
      ...gameState,
      currentCycle: newCycle,
      kpiHistory: [...gameState.kpiHistory, newKPIs]
    });

    const messages: Message[] = [
      { role: 'assistant', content: 'Thank you for your input. Let\'s see how it affects our business.' },
      { role: 'system', content: newScenario },
    ];

    const updatedGameState: GameState = {
      ...gameState,
      currentCycle: newCycle,
      kpiHistory: [...gameState.kpiHistory, newKPIs],
      messages: [...gameState.messages, ...messages],
    };

    return { messages, updatedGameState };
  }
}
