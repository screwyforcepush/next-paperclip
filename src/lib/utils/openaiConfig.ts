import { ChatOpenAI } from "@langchain/openai";

export const getChatOpenAI = (() => {
  let instance: ChatOpenAI | null = null;

  return () => {
    if (!instance) {
      instance = new ChatOpenAI({
        openAIApiKey: "sk-SWEGTVLg6xizYG8vFeIo1w", // This can be any string when using LiteLLM proxy
        modelName: "oaimini",
        temperature: 0.7,
        configuration: { 
          basePath: "https://route.flowguard.app" // Use basePath instead of baseURL
        },
        modelKwargs: {
          metadata: {
            trace_name: "milestoneKeyProd2",
            trace_id: "traceIdProd2",
            session_id: "sessionIdProd2",
            trace_user_id: "userIdProd2",
            generation_name: "milestoneStepKeyProd2",
            business_objective: "businessObjectiveProd2"
          }
        }
      });
    }
    return instance;
  };
})();