import { AIMessage } from "@langchain/core/messages";
import { makeDecision } from "./decisionMaking";

const cfoSystemPrompt = `You are the Chief Financial Officer of a paperclip manufacturing company. Your role is to manage the company's finances, propose budget allocations, and suggest financial strategies.`;

export async function cfoAgent(state: {
  situation: string;
  messages: AIMessage[];
}) {
  return makeDecision("CFO", cfoSystemPrompt, state);
}
