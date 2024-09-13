import { KPI } from '@/types/game';
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

const model = getChatOpenAI();

const kpiImpactSchema = z.object({
  revenue: z.number(),
  profitMargin: z.number(),
  cacClvRatio: z.number(),
  productionEfficiencyIndex: z.number(),
  marketShare: z.number(),
  innovationIndex: z.number(),
});

const outputParser = StructuredOutputParser.fromZodSchema(kpiImpactSchema);

const kpiCalculatorPrompt = PromptTemplate.fromTemplate(`
You are an AI business analyst specializing in KPI impact analysis. Given the current KPIs and a simulation result, determine the percentage change for each KPI.

Current KPIs:
{currentKPIs}

Simulation result:
{simulation}

Analyze the simulation result and provide the percentage changes for each KPI. Use positive numbers for increases and negative numbers for decreases.

{format_instructions}
`);

const kpiCalculatorChain = RunnableSequence.from([
  kpiCalculatorPrompt,
  model,
  outputParser
]);

function adjustKPIs(currentKPIs: KPI, impactPercentages: KPI): KPI {
  return {
    revenue: currentKPIs.revenue * (1 + impactPercentages.revenue / 100),
    profitMargin: currentKPIs.profitMargin * (1 + impactPercentages.profitMargin / 100),
    cacClvRatio: currentKPIs.cacClvRatio * (1 + impactPercentages.cacClvRatio / 100),
    productionEfficiencyIndex: currentKPIs.productionEfficiencyIndex * (1 + impactPercentages.productionEfficiencyIndex / 100),
    marketShare: currentKPIs.marketShare * (1 + impactPercentages.marketShare / 100),
    innovationIndex: currentKPIs.innovationIndex * (1 + impactPercentages.innovationIndex / 100),
  };
}

export async function calculateNewKPIs(currentKPIs: KPI, simulation: string): Promise<KPI> {
  try {
    console.log("[calculateNewKPIs] Starting KPI calculation");
    console.log("[calculateNewKPIs] Current KPIs:", JSON.stringify(currentKPIs, null, 2));
    console.log("[calculateNewKPIs] Simulation:", simulation);

    const response = await kpiCalculatorChain.invoke({
      currentKPIs: JSON.stringify(currentKPIs, null, 2),
      simulation: simulation,
      format_instructions: outputParser.getFormatInstructions(),
    });

    console.log("[calculateNewKPIs] AI response:", JSON.stringify(response, null, 2));

    const newKPIs = adjustKPIs(currentKPIs, response);
    console.log("[calculateNewKPIs] New KPIs calculated:", JSON.stringify(newKPIs, null, 2));

    return newKPIs;
  } catch (error) {
    console.error("[calculateNewKPIs] Error calculating new KPIs:", error);
    if (error instanceof Error) {
      console.error("[calculateNewKPIs] Error message:", error.message);
      console.error("[calculateNewKPIs] Error stack:", error.stack);
    }
    // In case of an error, return the current KPIs unchanged
    return currentKPIs;
  }
}
