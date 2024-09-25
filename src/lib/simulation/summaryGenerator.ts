import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business';

const model = getChatOpenAI();

export async function generateSummary(currentScenario: string, userInput: string, simplifiedMessages: string[]): Promise<string> {
  // Combine all simulation messages into a single string
  const simulationContent = simplifiedMessages.join('\n');

  const promptTemplate = PromptTemplate.fromTemplate(`
Universal Paperclips has faced an inflection point. 
The CEO sought advice from an external Advisor. 
The Universal Paperclips C-suite team decided internally how to proceed.
The outcome of their decision has unfolded.

[TASK]
  Distill the C-suite's reaction to the Advice, and the resulting Outcome, into a maximally compressed summary.
  Respond with a single paragraph narrative.
[/TASK]

${BUSINESS_OVERVIEW}

Inflection Point:
{currentScenario}

Advisor:
{userInput}

{simulationContent}
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
  });

  return response.trim();
}