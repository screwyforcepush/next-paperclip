import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4",
});

const ceoSystemPrompt = `You are the CEO of a paperclip manufacturing company. Your role is to make high-level decisions and delegate tasks to your C-suite team. Consider the user's advice, but make your own decisions based on the company's best interests.`;

const ceoPrompt = PromptTemplate.fromTemplate(`
Current business situation: {situation}
User advice: {userAdvice}

Based on this information, what high-level decision would you make and how would you delegate tasks to your C-suite team?
`);

const ceoChain = RunnableSequence.from([
  ceoPrompt,
  model,
  new StringOutputParser(),
]);

export async function ceoAgent(state: {
  situation: string;
  userAdvice: string;
  messages: BaseMessage[];
}) {
  const response = await ceoChain.invoke({
    situation: state.situation,
    userAdvice: state.userAdvice,
  });

  return {
    messages: [new AIMessage({ content: response, name: "CEO" })],
  };
}
