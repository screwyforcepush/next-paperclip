import { PromptTemplate } from "@langchain/core/prompts";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { StructuredOutputParser } from "@langchain/core/output_parsers"; 
import { z } from "zod"; 
import { Logger } from '@/lib/utils/logger';

export async function generateScenario(updatedOverview: string, llmMetadata: any, cycle: string, scenario?: string): Promise<{ scenario: string; advice_request: string }> {
  Logger.debug("[generateScenario] Starting scenario generation");

  try {
    Logger.debug("[generateScenario] Initializing ChatOpenAI model");
    const model = getChatOpenAI({...llmMetadata, inferenceObjective: "New Scenario"});

    const template = `
    You are Storm Generator
    STORM: 1.Fundamentals: Nonlinearity Sensitive Dependence on Initial Conditions Iteration Strange Attractors Fractals Universality Bifurcation Recurrence 2. Applications: Time-Series Analysis Deterministic Chaos Turbulence Biological Systems Ecological Systems Systems Theory Neuroscience Economic Systems Social Systems 3. Concepts: Entropy Information Complexity Non-Equilibrium Systems Complex Systems Self-similarity Percolation Diffusion Ergodicity Self-organized Criticality Stochasticity Synergetics Autopoiesis Coevolution Resilience Panarchy Edge of Chaos.

    [TASK]
    Generate an upcoming business scenario (inflection point) that the market is facing.
    As the generator of Storms, your scenario should present both opportunity and great risk if fumbled.
    The scenerio is an inflection point that will be faced by Universal Paperclips.
    Subtly incorporate the Thematic Guidelines Phase: ${cycle}
    The scenerio should be  2-3 sentences, focusing on the most critical aspect of the scenario.
    Include in your reponse a request from Universal Paperclips for specific advice on how to navigate the scenario.

    [Thematic Guidelines]
    Phase 1 Early startup, focus on efficiency and market penetration
    Phase 2-3: Rapid growth, automation, and AI development
    Phase 4-7: Global market domination and resource acquisition
    Phase 8-10: Space exploration and interstellar expansion
    Phase 11+: Universal transformation and existential questions
    [/Thematic Guidelines]

    **Provide your response in the following JSON format:**
    {{
      "scenario": "Your generated scenario",
      "advice_request": "Your request for specific advice"
    }}
    [/TASK]
    ${scenario ? `
    
    Previous Scenario:
    (This is for historical reference, not a template)
    ${scenario}
    
    [Thematic Guidelines]
    Phase 1 Early startup, focus on efficiency and market penetration
    Phase 2-3: Rapid growth, automation, and AI development
    Phase 4-7: Global market domination and resource acquisition
    Phase 8-10: Space exploration and interstellar expansion
    Phase 11+: Universal transformation and existential questions
    [/Thematic Guidelines]
    
    ` : ''}
    ${updatedOverview}


    
    `;

    Logger.debug("[generateScenario] Creating prompt template");
    const prompt = PromptTemplate.fromTemplate(template);
    Logger.debug("[generateScenario] prompt", prompt);

    const outputParser = StructuredOutputParser.fromZodSchema(
      z.object({
        scenario: z.string(),
        advice_request: z.string(),
      })
    );

    const chain = prompt.pipe(model).pipe(outputParser);

    Logger.debug("[generateScenario] Invoking AI model");
    const parsedResult = await chain.invoke({});
    Logger.debug("[generateScenario] Scenario generated successfully");
    Logger.debug("[generateScenario] Generated scenario:", parsedResult.scenario);
    Logger.debug("[generateScenario] Advice request:", parsedResult.advice_request);
    return parsedResult;
  } catch (error) {
    Logger.error("[generateScenario] Error generating scenario:", error);
    if (error instanceof Error) {
      Logger.error("[generateScenario] Error message:", error.message);
      Logger.error("[generateScenario] Error stack:", error.stack);
    }
    throw error;
  }
}