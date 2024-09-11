import { AIMessage } from "@langchain/core/messages";
import { makeDecision } from "./decisionMaking";

const ctoSystemPrompt = `You are the Chief Technology Officer of a paperclip manufacturing company. Your role is to propose technological innovations and improvements to the production process.`;

export async function ctoAgent(state: {
  situation: string;
  messages: AIMessage[];
}) {
  return makeDecision("CTO", ctoSystemPrompt, state);
}
