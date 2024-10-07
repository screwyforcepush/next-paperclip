import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business';
import { Order } from '@/types/game';

const model = getChatOpenAI();

export async function generateSummary(
  currentScenario: string, 
  userInput: string, 
  simplifiedMessages: string[],
  orders: Order[]
): Promise<string> {
  // Combine all simulation messages into a single string
  const simulationContent = simplifiedMessages.join('\n');

  // Process orders into a string
  const orderSummary = orders.map(order => `${order.persona} - ${order.action}: ${order.reason}`).join('\n');

  const promptTemplate = PromptTemplate.fromTemplate(`
Universal Paperclips has faced an inflection point. 
The CEO sought advice from an external Advisor. 
The Universal Paperclips C-suite team decided internally how to proceed.
The outcome of their decision has unfolded.
The market has reacted.

[TASK]
  Distill the C-suite's reaction to the Advice, the resulting Outcome, and a Market Reaction highlight, into a maximally compressed summary.
  Respond with a single paragraph narrative.
[/TASK]

${BUSINESS_OVERVIEW}

Inflection Point:
{currentScenario}

Advisor:
{userInput}

{simulationContent}

Market Reaction:
{orderSummary}
  `);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke({
    currentScenario,
    userInput,
    simulationContent,
    orderSummary,
  });

  return response.trim();
}