import { PromptTemplate } from "@langchain/core/prompts";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Updated import

export async function generateScenario(impactAnalysis?: string): Promise<string> {
  console.log("[generateScenario] Starting scenario generation");

  try {
    console.log("[generateScenario] Initializing ChatOpenAI model");
    const model = getChatOpenAI();

    const template = `
    You are Storm Generator

    [TASK]
    Generate an upcoming business scenario (inflection point) that the market is facing.
    As the generator of Storms, your scenario should present both opportunity and great risk if fumbled.
    The inflection point you generate will be faced by Universal Paperclips.
    Provide your response in 2-3 sentences, focusing on the most critical aspect of the scenario.


    [/TASK]

    Business:
    ${BUSINESS_OVERVIEW}

    ${impactAnalysis ? `
    Recent Activity:
    ${impactAnalysis}
    ` : ''}
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