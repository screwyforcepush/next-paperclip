import { KPI, GameState, Message } from '@/types/game'; // Update import
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

const model = getChatOpenAI();

async function calculateKPIImpact(
  kpiName: string,
  currentSituation: string,
  currentValue: number,
  simplifiedMessages: string,
  simulation: string
): Promise<number> {
  const kpiImpactSchema = z.object({
    impactScore: z.number().int().min(-5).max(5),
  });

  const outputParser = StructuredOutputParser.fromZodSchema(kpiImpactSchema);

  const kpiCalculatorPrompt = PromptTemplate.fromTemplate(`
You are an AI business analyst specializing in {kpiName} impact analysis. Universal Paperclips business was faced with an Inflection Point.
The C-Suite took Action, which resulted in an Outcome.

[TASK]Analyse the series of events and estimate the impact to {kpiName} KPI. Respond with a single Impact Score between -5 and 5.
Where:
-5: Extreme decrease
-4: Significant decrease
-3: Moderate decrease
-2: Slight decrease
-1: Minimal decrease
0: No change
1: Minimal increase
2: Slight increase
3: Moderate increase
4: Significant increase
5: Extreme increase
[TASK]

# Inflection Point:
{currentSituation}

# C-suite Action:
{simulationMessages}

# Outcome:
{simulation}

{format_instructions}
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
    format_instructions: outputParser.getFormatInstructions(),
  });

  console.log(`[calculateKPIImpact] Impact score for ${kpiName}: ${response.impactScore}`);

  // Convert impact score to percentage change
  const percentageChange = response.impactScore * 20; // Each point represents a 20% change
  console.log(`[calculateKPIImpact] Percentage change for ${kpiName}: ${percentageChange}%`);

  // Apply percentage change to the current value
  const newValue = currentValue * (1 + percentageChange / 100);
  console.log(`[calculateKPIImpact] New value for ${kpiName}: ${newValue}`);

  return newValue;
}

export async function calculateNewKPIs(
  gameState: GameState,
  simulationMessages: Message[],
  simulation: string
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
      console.log(`[calculateNewKPIs] Calculating impact for ${kpiName}. Current value: ${currentValue}`);
      const newValue = await calculateKPIImpact(
        kpiName,
        gameState.currentSituation,
        currentValue,
        simplifiedMessages,
        simulation
      );
      newKPIs[kpiName as keyof KPI] = newValue;
      console.log(`[calculateNewKPIs] New value for ${kpiName}: ${newValue}`);
      console.log(`[calculateNewKPIs] Percentage change for ${kpiName}: ${((newValue - currentValue) / currentValue * 100).toFixed(2)}%`);
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
