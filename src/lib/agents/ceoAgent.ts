import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4o-mini",
});

const ceoPrompt = PromptTemplate.fromTemplate(`
You are the CEO of a paperclip manufacturing company. Your role is to make high-level decisions and delegate tasks to your C-suite team. Consider the user's advice, but make your own decisions based on the company's best interests.

Current business situation: {situation}
User advice: {userAdvice}

Based on this information, make a high-level decision and delegate expected outcomes to your C-suite team.
Provide your response in the following JSON format:

{{
  "decision": "Your high-level decision",
  "assignments": {{
    "CTO": "Task for CTO",
    "CFO": "Task for CFO",
    "CMO": "Task for CMO",
    "COO": "Task for COO"
  }}
}}
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
  const response = await ceoChain.invoke({
    situation: state.situation,
    userAdvice: state.userAdvice,
  });

  return {
    messages: [new AIMessage({ content: JSON.stringify(response), name: "CEO" })],
  };
}
