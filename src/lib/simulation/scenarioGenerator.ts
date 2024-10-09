import { PromptTemplate } from "@langchain/core/prompts";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { StructuredOutputParser } from "@langchain/core/output_parsers"; 
import { z } from "zod"; 

export async function generateScenario(updatedOverview: string, llmMetadata: any): Promise<{ scenario: string; advice_request: string }> {
  console.log("[generateScenario] Starting scenario generation");

  try {

    console.log("[generateScenario] Initializing ChatOpenAI model");
    const model = getChatOpenAI({...llmMetadata, inferenceObjective: "New Scenario"});

    const template = `
    You are Storm Generator

    [TASK]
    Generate an upcoming business scenario (inflection point) that the market is facing.
    As the generator of Storms, your scenario should present both opportunity and great risk if fumbled.
    The scenerio is an inflection point that will be faced by Universal Paperclips.
    The scenerio should be  2-3 sentences, focusing on the most critical aspect of the scenario.
    Include in your reponse a request from Universal Paperclips for specific advice on how to navigate the scenario.

    **Provide your response in the following JSON format:**
    {{
      "scenario": "Your generated scenario",
      "advice_request": "Your request for specific advice"
    }}
    [/TASK]

    ${updatedOverview}


    
    `;

    console.log("[generateScenario] Creating prompt template");
    const prompt = PromptTemplate.fromTemplate(template);

    const outputParser = StructuredOutputParser.fromZodSchema(
      z.object({
        scenario: z.string(),
        advice_request: z.string(),
      })
    );

    const chain = prompt.pipe(model).pipe(outputParser);

    console.log("[generateScenario] Invoking AI model");
    const parsedResult = await chain.invoke({});
    console.log("[generateScenario] Scenario generated successfully");
    console.log("[generateScenario] Generated scenario:", parsedResult.scenario);
    console.log("[generateScenario] Advice request:", parsedResult.advice_request);
    return parsedResult;
  } catch (error) {
    console.error("[generateScenario] Error generating scenario:", error);
    if (error instanceof Error) {
      console.error("[generateScenario] Error message:", error.message);
      console.error("[generateScenario] Error stack:", error.stack);
    }
    throw error;
  }
}