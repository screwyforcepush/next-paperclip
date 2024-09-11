import { GameState, KPI } from '../../types/game';

export async function generateScenario(gameState?: GameState): Promise<string> {
  console.log("[generateScenario] Generating new scenario");
  
  let currentKPIs: KPI;
  if (gameState && gameState.kpiHistory && gameState.kpiHistory.length > 0) {
    currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
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
  }

  console.log("[generateScenario] Current KPIs:", currentKPIs);

  // Generate a scenario based on the current KPIs
  const scenario = `
Business Cycle ${gameState ? gameState.currentCycle + 1 : 1}

Current KPIs:
Revenue: ${currentKPIs.revenue}
Profit Margin: ${currentKPIs.profitMargin}
CAC/CLV Ratio: ${currentKPIs.cacClvRatio}
Production Efficiency Index: ${currentKPIs.productionEfficiencyIndex}
Market Share: ${currentKPIs.marketShare}
Innovation Index: ${currentKPIs.innovationIndex}

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