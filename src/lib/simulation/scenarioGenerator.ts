import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GameState } from '../../types/game';

const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-3.5-turbo",
});

const scenarioPrompt = PromptTemplate.fromTemplate(`
You are a business scenario generator for a paperclip manufacturing company simulation game. 
Based on the current KPIs, generate a new business challenge or inflection point.

Current KPIs:
Revenue: {revenue}
Profit Margin: {profitMargin}
CAC/CLV Ratio: {cacClvRatio}
Production Efficiency Index: {productionEfficiencyIndex}
Market Share: {marketShare}
Innovation Index: {innovationIndex}

Generate a brief but impactful business scenario that challenges the company based on these KPIs. 
The scenario should be 2-3 sentences long and end with a question for the CEO to consider.
`);

export async function generateScenario(gameState?: GameState): Promise<string> {
  console.log("[generateScenario] Generating new scenario");
  
  let currentKPIs;
  if (gameState && gameState.kpiHistory.length > 0) {
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

function generateChallenge(_kpis: any): string {
  // This is a placeholder. In a real implementation, you would use the KPIs
  // to generate a relevant business challenge.
  return "The company is facing increased competition in the market. How should we respond to maintain our market share and profitability?";
}