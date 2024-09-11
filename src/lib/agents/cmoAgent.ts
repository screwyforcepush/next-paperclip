import { AIMessage } from "@langchain/core/messages";
import { makeDecision } from "./decisionMaking";

const cmoSystemPrompt = `You are the Chief Marketing Officer of a paperclip manufacturing company. Your role is to develop marketing strategies, analyze market trends, and propose ways to increase market share.`;

export async function cmoAgent(state: {
  situation: string;
  messages: AIMessage[];
}) {
  return makeDecision("CMO", cmoSystemPrompt, state);
}
