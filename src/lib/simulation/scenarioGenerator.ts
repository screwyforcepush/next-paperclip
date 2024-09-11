import { GameState, KPI } from '../../types/game';

export async function generateScenario(gameState?: GameState): Promise<string> {
  console.log("[generateScenario] Generating new scenario");
  
  let currentKPIs: KPI;
  let currentCycle: number;

  if (gameState && gameState.kpiHistory && gameState.kpiHistory.length > 0) {
    currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    currentCycle = gameState.currentCycle;
  } else {
    // Default KPIs for a new game
    currentKPIs = {
      revenue: 1000000,
      profitMargin: 0.1,
      cacClvRatio: 0.5,
      productionEfficiencyIndex: 0.7,
      marketShare: 0.05,
      innovationIndex: 0.6
    };
    currentCycle = 1;
  }

  console.log("[generateScenario] Current KPIs:", currentKPIs);

  // Generate a scenario based on the current KPIs
  const scenario = `Welcome to Universal Paperclips! Let's start your journey as a business consultant.

Business Cycle ${currentCycle}

Current KPIs:
Revenue: $${currentKPIs.revenue.toLocaleString()}
Profit Margin: ${(currentKPIs.profitMargin * 100).toFixed(1)}%
CAC/CLV Ratio: ${currentKPIs.cacClvRatio.toFixed(2)}
Production Efficiency Index: ${currentKPIs.productionEfficiencyIndex.toFixed(2)}
Market Share: ${(currentKPIs.marketShare * 100).toFixed(1)}%
Innovation Index: ${currentKPIs.innovationIndex.toFixed(2)}

${generateChallenge(currentKPIs)}
`;

  console.log("[generateScenario] Generated scenario:", scenario);
  return scenario;
}

function generateChallenge(kpis: KPI): string {
  // This is a placeholder. In a real implementation, you would use the KPIs
  // to generate a relevant business challenge.
  const challenge = "The company is facing increased competition in the market. ";
  
  if (kpis.marketShare < 0.1) {
    return challenge + "How should we respond to increase our market share and maintain profitability?";
  } else if (kpis.profitMargin < 0.15) {
    return challenge + "What strategies can we implement to improve our profit margin while maintaining our market position?";
  } else {
    return challenge + "How can we leverage our strong position to further innovate and expand our market share?";
  }
}