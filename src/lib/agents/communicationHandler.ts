import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({ 
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

const communicationPrompt = PromptTemplate.fromTemplate(`
You are the {role} of a paperclip manufacturing company. 
The CEO has made the following decision: {ceoDecision}

Based on this decision and your role, formulate a response or question to the CEO. 
Your response should be concise (1-2 sentences) and relate to your specific area of expertise.
`);

const communicationChain = communicationPrompt.pipe(model).pipe(new StringOutputParser());

export async function handleCommunication(role: string, ceoDecision: string): Promise<BaseMessage> {
  const response = await communicationChain.invoke({ role, ceoDecision });
  return new AIMessage({ content: response, name: role });
}