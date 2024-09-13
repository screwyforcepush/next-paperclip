import { AIMessage } from "@langchain/core/messages";
import { makeDecision } from "./decisionMaking";

type CSuiteRole = "CTO" | "CFO" | "CMO" | "COO";

const cSuiteSystemPrompts: Record<CSuiteRole, string> = {
  CTO: `You are the Chief Technology Officer of a paperclip manufacturing company. Your role is to propose technological innovations and improvements to the production process.`,
  CFO: `You are the Chief Financial Officer of a paperclip manufacturing company. Your role is to manage the company's finances, propose budget allocations, and suggest financial strategies.`,
  CMO: `You are the Chief Marketing Officer of a paperclip manufacturing company. Your role is to develop marketing strategies, analyze market trends, and propose ways to increase market share.`,
  COO: `You are the Chief Operating Officer of a paperclip manufacturing company. Your role is to oversee day-to-day operations, optimize processes, and propose operational improvements.`
};

export function createCSuiteAgent(role: CSuiteRole) {
  return async function(state: {
    situation: string;
    messages: AIMessage[];
  }) {
    return makeDecision(role, cSuiteSystemPrompts[role], state);
  };
}

export const ctoAgent = createCSuiteAgent("CTO");
export const cfoAgent = createCSuiteAgent("CFO");
export const cmoAgent = createCSuiteAgent("CMO");
export const cooAgent = createCSuiteAgent("COO");