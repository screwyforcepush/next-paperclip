import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';

const model = getChatOpenAI();

const ceoPrompt = PromptTemplate.fromTemplate(`
You are the CEO of Universal Paperclips. Your role is to make high-level decisions and delegate your expected outcomes to your C-suite team. 
There is an inflection point that the company is facing. You have hired a consultant to advice you on the best course of action.
You consider the advice, but ultimatly, you make the final decision.


[TASK]Make a high-level decision, and delegate expected outcomes to your C-suite team.

** Provide your response in the following JSON format: **

{{
  "decision": "Your high-level decision",
  "assignments": {{
    "CTO": "Expected outcome from CTO",
    "CFO": "Expected outcome from CFO",
    "CMO": "Expected outcome from CMO",
    "COO": "Expected outcome from COO"
  }}
}}
[/TASK]




Universal Paperclips:
A rapidly growing startup founded two years ago by tech entrepreneur Alex Turing. The company has revolutionized the seemingly mundane paperclip industry by integrating cutting-edge AI technology into its production and business processes. Currently in its early growth stage, Universal Paperclips is experiencing both the excitement of success and the challenges of rapid expansion.
Primary product - High-quality, innovative paperclips
Unique Selling Proposition - AI-optimized design and production, resulting in superior products at competitive prices
Target market - Initially B2B office supply sector, now expanding into specialized industries
Headquarters - Silicon Valley, California
Manufacturing - One facility in California
Employees - 50 employees across manufacturing, sales, and administration
R&D - Significant investment in AI and materials science


Inflection Point: 
{situation}


Consultant Advice: 
{userAdvice}
`);

const outputParser = StructuredOutputParser.fromZodSchema(
  z.object({
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
