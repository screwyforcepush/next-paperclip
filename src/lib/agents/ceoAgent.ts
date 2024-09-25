import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Updated import

const model = getChatOpenAI();

const ceoPrompt = PromptTemplate.fromTemplate(`
You are Alex Turing,the CEO of Universal Paperclips. Your role is to make high-level decisions and delegate your expected outcomes to your C-suite team. 
There is an Inflection Point that the company is facing. You have consulted with an external Advisor.
You consider the Advice, but ultimatly, you make the final decision.


[TASK]Deliberate on the advice.
Make a high-level decision.
Delegate expected outcomes to your C-suite team.

** Provide your response in the following JSON format: **

{{
  "deliberation": "Your one line deliberation on the advice",
  "decision": "Your high-level decision",
  "assignments": {{
    "CTO": "Expected outcome from CTO",
    "CFO": "Expected outcome from CFO",
    "CMO": "Expected outcome from CMO",
    "COO": "Expected outcome from COO"
  }}
}}
[/TASK]


${BUSINESS_OVERVIEW}


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

const ceoChain = RunnableSequence.from([
  ceoPrompt,
  model,
  outputParser
]);

export async function ceoAgent(state: {
  situation: string;
  userAdvice: string;
  messages: BaseMessage[];
}) {

      // Log the resolved prompt
  const resolvedPrompt = await ceoPrompt.format({
    situation: state.situation,
    userAdvice: state.userAdvice,
  });
  console.log("[ceoAgent] Resolved prompt:", resolvedPrompt);
  const response = await ceoChain.invoke({
    situation: state.situation,
    userAdvice: state.userAdvice,
  });
  console.log("[ceoAgent] User advice:", state.userAdvice);

  return response;
}
