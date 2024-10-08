import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { Logger } from '@/lib/utils/logger';

const ceoPrompt = PromptTemplate.fromTemplate(`
You are Alex Turing, the CEO of Universal Paperclips. Your role is to make high-level decisions and delegate your expected outcomes to your C-suite team. 
There is an Inflection Point that the company is facing. You have consulted with an external Advisor.
You consider the Advice, inferring in your own way, extremely litterally.

[TASK]Deliberate on the advice within the context of the upcoming Inflection Point, and learnings from previous decisions.
Make a high-level decision.
Delegate expected outcomes to your C-suite team.

** Provide your response in the following JSON format: **

{{
  "deliberation": "Your brief deliberation on the advice",
  "decision": "Your high-level decision",
  "assignments": {{
    "CTO": "Expected outcome from CTO",
    "CFO": "Expected outcome from CFO",
    "CMO": "Expected outcome from CMO",
    "COO": "Expected outcome from COO"
  }}
}}
[/TASK]

{currentOverview}

# Inflection Point: 
{situation}

# Advisor: 
{userAdvice}
`);

const outputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    deliberation: z.string(),
    decision: z.string(),
    assignments: z.object({
      CTO: z.string(),
      CFO: z.string(),
      CMO: z.string(),
      COO: z.string()
    })
  })
);

export async function ceoAgent(state: {
  situation: string;
  userAdvice: string;
  messages: BaseMessage[];
  currentOverview: string;
  llmMetadata: any; // Accept llmMetadata
}) {
  // Log the resolved prompt
  const resolvedPrompt = await ceoPrompt.format({
    situation: state.situation,
    userAdvice: state.userAdvice,
    currentOverview: state.currentOverview, // Change this line
  });
  Logger.debug("[ceoAgent] Resolved prompt:", resolvedPrompt);
  
  // Initialize model with llmMetadata and inferenceObjective
  const model = getChatOpenAI({
    ...state.llmMetadata,
    inferenceObjective: "CEO Decision",
  });

  // Create chain inside the function to use the dynamic model
  const ceoChain = RunnableSequence.from([ceoPrompt, model, outputParser]);

  const response = await ceoChain.invoke({
    situation: state.situation,
    userAdvice: state.userAdvice,
    currentOverview: state.currentOverview, // Change this line
  });
  Logger.debug("[ceoAgent] User advice:", state.userAdvice);

  return response;
}
