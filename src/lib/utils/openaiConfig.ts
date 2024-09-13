import { ChatOpenAI } from "@langchain/openai";

export const getChatOpenAI = (() => {
  let instance: ChatOpenAI | null = null;

  return () => {
    if (!instance) {
      instance = new ChatOpenAI({
        temperature: 0.7,
        modelName: "gpt-4o-mini",
      });
    }
    return instance;
  };
})();