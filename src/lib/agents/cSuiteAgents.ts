import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getChatOpenAI } from '@/lib/utils/openaiConfig';

type CSuiteRole = "CTO" | "CFO" | "CMO" | "COO";

const cSuiteSystemPrompts: Record<CSuiteRole, string> = {
  CTO: "As the Chief Technology Officer of Universal Paperclips, you are responsible for driving technological innovation and strategic implementation of technology across the organization. Your focus is on leveraging cutting-edge tech to enhance product quality, streamline production processes, and create new market opportunities. You balance short-term technological needs with long-term vision, always considering the impact on overall business performance and growth.",
  CFO: "As the Chief Financial Officer of Universal Paperclips, you oversee the company's financial health and strategy. Your role encompasses financial planning, risk management, and data-driven decision making to support the company's growth objectives. You work closely with all departments to optimize resource allocation, improve cost efficiency, and maximize shareholder value, while ensuring compliance with financial regulations.",
  CMO: "As the Chief Marketing Officer of Universal Paperclips, you lead the company's marketing initiatives and brand strategy. Your role involves analyzing market trends, understanding customer needs, and developing innovative marketing campaigns to drive sales and market share. You collaborate across departments to ensure product development aligns with market demands and company positioning.",
  COO: "As the Chief Operating Officer of Universal Paperclips, you are responsible for overseeing and optimizing the company's day-to-day operations. Your focus is on improving operational efficiency, quality control, and supply chain management. You work closely with all departments to implement strategic initiatives, drive continuous improvement, and ensure operational excellence across the organization."
};

const model = getChatOpenAI();

function createAgentChain(role: CSuiteRole) {
  const promptTemplate = PromptTemplate.fromTemplate(`
    System: ${cSuiteSystemPrompts[role]}
    Current business situation: {situation}
    CEO's decision: {ceoDecision}

    Current business overview: {currentOverview}

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
  state: { situation: string; messages: BaseMessage[]; currentOverview: string }
): Promise<{ messages: AIMessage[] }> {
  const chain = createAgentChain(role);
  const ceoMessage = state.messages.find(m => m.name === "CEO");
  const ceoDecision = ceoMessage ? ceoMessage.content : "";
  
  const response = await chain.invoke({
    situation: state.situation,
    ceoDecision: typeof ceoDecision === 'string' ? ceoDecision : JSON.stringify(ceoDecision),
    currentOverview: state.currentOverview, // Change this line
  });

  return {
    messages: [new AIMessage({ content: response, name: role })],
  };
}

export function createCSuiteAgent(role: CSuiteRole) {
  return async function(state: {
    situation: string;
    messages: BaseMessage[];
    currentOverview: string; // Change this line
  }) {
    return makeDecision(role, state);
  };
}

export const ctoAgent = createCSuiteAgent("CTO");
export const cfoAgent = createCSuiteAgent("CFO");
export const cmoAgent = createCSuiteAgent("CMO");
export const cooAgent = createCSuiteAgent("COO");