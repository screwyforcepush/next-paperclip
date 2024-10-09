import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business';
import { Order } from '@/types/game';

export async function generateSummary(
  currentScenario: string, 
  userInput: string, 
  simplifiedMessages: string[],
  orders: Order[],
  llmMetadata: any // Accept llmMetadata
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
  Distill the C-suite's reaction to the Advice, and the resulting Outcome, into a maximally compressed, single paragraph summary.
  Add a one line highlight of the Market Reaction, followed by a directional Buy/Sell volume indicator.
  eg. 
Buy  : ●●
Sell : ●●●●●●●●●●

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

  // Initialize model with llmMetadata and inferenceObjective
  const model = getChatOpenAI({
    ...llmMetadata,
    inferenceObjective: "Summarise Simulation",
  });

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


export async function updateOverview(
  currentOverview: string, 
  recentEvents: string, 
  llmMetadata: any // Accept llmMetadata
): Promise<string> {

  const promptTemplate = PromptTemplate.fromTemplate(`
  CopyYou are the Business Intelligence Analyst for Universal Paperclips. Your role is to provide a concise, accurate snapshot of the company's current position and resources.

[TASK]
Given the Recent Events, update the Business Overview for Universal Paperclips. 
Only modify portions of the Overview when there is clear evidence from Recent Events.

Update Guidelines:
1. Market position and competition
2. Product/service offerings
3. Key resources (human, physical, technological, financial)
4. Target markets
5. Strategic partnerships
6. Major milestones or setbacks
7. R&D and innovation
8. Regulatory or legal impacts
9. Company culture

Produce a maximally compressed overview as 5-7 concise bullet points. Focus on the most significant changes, using factual information without elaboration. Your overview should provide a clear, holistic picture of Universal Paperclips' current state.

Response format:
The Heading of your overview is "Universal Paperclips Overview".
short description of the company.
Current State:
- bullet point 1
- bullet point 2
- bullet point 3
...
[/TASK]


# Current Business Overview:
{currentOverview}


# Recent Events:
{recentEvents}


  `);

  // Initialize model with llmMetadata and inferenceObjective
  const model = getChatOpenAI({
    ...llmMetadata,
    inferenceObjective: "Update Business Overview",
  });

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke({
    currentOverview,
    recentEvents,
  });

  return response.trim();
}