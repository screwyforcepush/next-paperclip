import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { GameState, KPI } from '../../types/game';

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

  const model = new ChatOpenAI({ 
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

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

  const prompt = PromptTemplate.fromTemplate(template);
  const chain = prompt.pipe(model);

  try {
    console.log("[generateScenario] Generating scenario");
    const result = await chain.invoke({});
    console.log("[generateScenario] Scenario generated successfully");
    return result.content as string;
  } catch (error) {
    console.error("[generateScenario] Error generating scenario:", error);
    throw error;
  }
}