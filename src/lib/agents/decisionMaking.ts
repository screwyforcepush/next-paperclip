import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4",
});

export function createAgentChain(role: string, systemPrompt: string) {
  const promptTemplate = PromptTemplate.fromTemplate(`
    System: ${systemPrompt}
    Current business situation: {situation}
    CEO's decision: {ceoDecision}

    As the {role}, what actions do you propose to take based on this information?
  `);

  return RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);
}

export async function makeDecision(
  role: string,
  systemPrompt: string,
  state: { situation: string; messages: BaseMessage[] }
): Promise<{ messages: AIMessage[] }> {
  const chain = createAgentChain(role, systemPrompt);
  const ceoDecision = state.messages.find(m => m.name === "CEO")?.content || "";
  
  const response = await chain.invoke({
    situation: state.situation,
    ceoDecision,
    role,
  });

  return {
    messages: [new AIMessage({ content: response, name: role })],
  };
}
