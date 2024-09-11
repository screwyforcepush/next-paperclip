import { AIMessage } from "@langchain/core/messages";
import { makeDecision } from "./decisionMaking";

const cooSystemPrompt = `You are the Chief Operating Officer of a paperclip manufacturing company. Your role is to oversee day-to-day operations, optimize processes, and propose operational improvements.`;

export async function cooAgent(state: {
  situation: string;
  messages: AIMessage[];
}) {
  return makeDecision("COO", cooSystemPrompt, state);
}
