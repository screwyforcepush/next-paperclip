import { KPI, GameState, Message } from '@/types/game'; // Update import
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

async function calculateKPIImpact(
  kpiName: string,
  currentSituation: string,
  currentValue: number,
  simplifiedMessages: string,
  simulation: string,
  llmMetadata: any // Accept llmMetadata
): Promise<number> {
  const kpiImpactSchema = z.object({
    impactAnalysis: z.string(),
    impactScore: z.number().int().min(-5).max(5),
  });

  const outputParser = StructuredOutputParser.fromZodSchema(kpiImpactSchema);

  // Initialize model with llmMetadata and inferenceObjective
  const model = getChatOpenAI({
    ...llmMetadata,
    inferenceObjective: `Calculate ${kpiName} Impact`,
  });

  const kpiCalculatorPrompt = PromptTemplate.fromTemplate(`
You are a Business Analyst specializing in {kpiName} impact analysis. 
[GROK]: 1. [DataCollect]:  1a. FactGathering→1b,2a 1b. IntuitHunch→1c,2c 2. [Contextualize]:  2a. BackgroundInfo→2b,2c,3a 2b. ExperienceMapping→2c,3b 2c. InsightCluster→3a,3b 3. [Interpret]:  3a. Rationalize→3b,4a 3b. Emote→3c,4b 4. [Understand]:  4a. ConceptMapping→4b,5a 4b. Empathize→4c, 5c 5. [Drink]: 5a. Internalize→5b,1a 5b. Saturation→5c,1b 5c. Grok→1c,2c

Universal Paperclips business was faced with an Inflection Point.
The C-Suite took Action, which resulted in an Outcome.

[TASK]Analyse the Inflection Point, C-suite Actions and the resulting Outcome, then estimate the impact to {kpiName} KPI. 
*Adhere to Response Schema*

impactAnalysis and {kpiName} impactScore integer on a scale of -5 to 5.
Where:
-5 = Extreme negative impact
-4 = Significant negative impact
-3 = Moderate negative impact
-2 = Slight negative impact
-1 = Minimal negative impact
0 = No impact
1 = Minimal positive impact
2 = Slight positive impact
3 = Moderate positive impact
4 = Significant positive impact
5 = Extreme positive impact
[TASK]

# Inflection Point:
{currentSituation}

# C-suite Actions:
{simulationMessages}

# Outcome:
{simulation}



# Response Schema:
** Provide your response in the following JSON format: **

{{
  "impactAnalysis": "Analysis of the impact to {kpiName}",
  "impactScore": "integer between -5 and 5"
}}
`);

  const kpiCalculatorChain = RunnableSequence.from([
    kpiCalculatorPrompt,
    model,
    outputParser
  ]);

  const response = await kpiCalculatorChain.invoke({
    currentSituation,
    kpiName,
    simulationMessages: simplifiedMessages,
    simulation,
  });

  console.log(`[calculateKPIImpact] Impact analysis for ${kpiName}: ${response.impactAnalysis}`);
  console.log(`[calculateKPIImpact] Impact score for ${kpiName}: ${response.impactScore}`);

  // Convert impact score to percentage change
  const multiplier = response.impactScore>0?1:-1;
  const rndMultiplier = Math.random() * multiplier;
  const percentageChange = response.impactScore * (response.impactScore * rndMultiplier); 
  console.log(`[calculateKPIImpact] Percentage change for ${kpiName}: ${percentageChange}%`);

  // Apply percentage change to the current value
  const newValue = currentValue * (1 + percentageChange / 100);
  console.log(`[calculateKPIImpact] New value for ${kpiName}: ${newValue}`);

  return newValue;
}

export async function calculateNewKPIs(
  gameState: GameState,
  simulationMessages: Message[],
  simulation: string,
  llmMetadata: any // Accept llmMetadata
): Promise<KPI> {
  try {
    console.log("[calculateNewKPIs] Starting KPI calculation");
    console.log("[calculateNewKPIs] Current Situation:", gameState.currentSituation);
    console.log("[calculateNewKPIs] Current KPIs:", JSON.stringify(gameState.kpiHistory[gameState.kpiHistory.length - 1], null, 2));
    console.log("[calculateNewKPIs] Simulation Messages:", JSON.stringify(simulationMessages, null, 2));
    console.log("[calculateNewKPIs] Final Simulation Result:", simulation);

    const currentKPIs = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const simplifiedMessages = simulationMessages
      .map(msg => `${msg.name || msg.role}: ${msg.content}`)
      .join('\n');

    const newKPIs: Partial<KPI> = {};

    for (const [kpiName, currentValue] of Object.entries(currentKPIs)) {
      if (kpiName !== 'sharePrice') {
        console.log(`[calculateNewKPIs] Calculating impact for ${kpiName}. Current value: ${currentValue}`);
        const newValue = await calculateKPIImpact(
          kpiName,
          gameState.currentSituation,
          currentValue,
          simplifiedMessages,
          simulation,
          llmMetadata // Pass llmMetadata to calculateKPIImpact
        );
        newKPIs[kpiName as keyof KPI] = newValue;
        console.log(`[calculateNewKPIs] New value for ${kpiName}: ${newValue}`);
        console.log(`[calculateNewKPIs] Percentage change for ${kpiName}: ${((newValue - currentValue) / currentValue * 100).toFixed(2)}%`);
      }
    }

    console.log("[calculateNewKPIs] All new KPIs calculated:", JSON.stringify(newKPIs, null, 2));

    return newKPIs as KPI;
  } catch (error) {
    console.error("[calculateNewKPIs] Error calculating new KPIs:", error);
    if (error instanceof Error) {
      console.error("[calculateNewKPIs] Error message:", error.message);
      console.error("[calculateNewKPIs] Error stack:", error.stack);
    }
    // In case of an error, return the current KPIs unchanged
    return gameState.kpiHistory[gameState.kpiHistory.length - 1];
  }
}