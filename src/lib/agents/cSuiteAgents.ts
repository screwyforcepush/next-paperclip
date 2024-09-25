import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Add this import

type CSuiteRole = "CTO" | "CFO" | "CMO" | "COO";

const cSuiteSystemPrompts: Record<CSuiteRole, string> = {
  CTO: `You are the Chief Technology Officer of Universal Paperclips. Your role is to propose technological innovations and improvements to the production process.`,
  CFO: `You are the Chief Financial Officer of Universal Paperclips. Your role is to manage the company's finances, propose budget allocations, and suggest financial strategies.`,
  CMO: `You are the Chief Marketing Officer of Universal Paperclips. Your role is to develop marketing strategies, analyze market trends, and propose ways to increase market share.`,
  COO: `You are the Chief Operating Officer of Universal Paperclips. Your role is to oversee day-to-day operations, optimize processes, and propose operational improvements.`
};

const model = getChatOpenAI();

function createAgentChain(role: CSuiteRole) {
  const promptTemplate = PromptTemplate.fromTemplate(`
    System: ${cSuiteSystemPrompts[role]}
    Current business situation: {situation}
    CEO's decision: {ceoDecision}

    ${BUSINESS_OVERVIEW}

    As the ${role}, what *SPECIFIC* action do you propose we take based on this information?

    [TASK]
    Respond with one line containing the single specific action you propose we take.
    [/TASK]
  `);

  return RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);
}

async function makeDecision(
  role: CSuiteRole,
  state: { situation: string; messages: BaseMessage[] }
): Promise<{ messages: AIMessage[] }> {
  const chain = createAgentChain(role);
  const ceoMessage = state.messages.find(m => m.name === "CEO");
  const ceoDecision = ceoMessage ? ceoMessage.content : "";
  
  const response = await chain.invoke({
    situation: state.situation,
    ceoDecision: typeof ceoDecision === 'string' ? ceoDecision : JSON.stringify(ceoDecision),
  });

  return {
    messages: [new AIMessage({ content: response, name: role })],
  };
}

export function createCSuiteAgent(role: CSuiteRole) {
  return async function(state: {
    situation: string;
    messages: BaseMessage[];
  }) {
    return makeDecision(role, state);
  };
}

export const ctoAgent = createCSuiteAgent("CTO");
export const cfoAgent = createCSuiteAgent("CFO");
export const cmoAgent = createCSuiteAgent("CMO");
export const cooAgent = createCSuiteAgent("COO");