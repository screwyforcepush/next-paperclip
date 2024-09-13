import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { GameState, KPI } from '../../types/game';
import { getChatOpenAI } from '@/lib/utils/openaiConfig';

export async function generateScenario(gameState?: GameState): Promise<string> {
  console.log("[generateScenario] Starting scenario generation");
  
  let currentKPIs: KPI;

  if (gameState && gameState.kpiHistory && gameState.kpiHistory.length > 0) {
    currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    console.log("[generateScenario] Using KPIs from game state");
  } else {
    console.log("[generateScenario] Using default KPIs for new game");
    currentKPIs = {
      revenue: 1000000,
      profitMargin: 0.1,
      cacClvRatio: 0.5,
      productionEfficiencyIndex: 0.7,
      marketShare: 0.05,
      innovationIndex: 0.6
    };
  }

  console.log("[generateScenario] Current KPIs:", JSON.stringify(currentKPIs, null, 2));

  try {
    console.log("[generateScenario] Initializing ChatOpenAI model");
    const model = getChatOpenAI();

    const template = `
    You are an AI business consultant for a paperclip company. Given the following KPIs:

    Revenue: ${currentKPIs.revenue}
    Profit Margin: ${currentKPIs.profitMargin}
    CAC/CLV Ratio: ${currentKPIs.cacClvRatio}
    Production Efficiency Index: ${currentKPIs.productionEfficiencyIndex}
    Market Share: ${currentKPIs.marketShare}
    Innovation Index: ${currentKPIs.innovationIndex}

    Generate a business scenario (inflection point) that the company is facing. The scenario should:
    1. Be related to the current state of the company as reflected in the KPIs.
    2. Present a clear challenge or opportunity.
    3. End with a question for the CEO to consider.

    Provide your response in 2-3 sentences, focusing on the most critical aspect of the scenario.
    `;

    console.log("[generateScenario] Creating prompt template");
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(model);

    console.log("[generateScenario] Invoking AI model");
    const result = await chain.invoke({});
    console.log("[generateScenario] Scenario generated successfully");
    console.log("[generateScenario] Generated scenario:", result.content);
    return result.content as string;
  } catch (error) {
    console.error("[generateScenario] Error generating scenario:", error);
    if (error instanceof Error) {
      console.error("[generateScenario] Error message:", error.message);
      console.error("[generateScenario] Error stack:", error.stack);
    }
    throw error;
  }
}