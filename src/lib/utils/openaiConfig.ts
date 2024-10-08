import { ChatOpenAI } from "@langchain/openai";

const DEFAULT_METADATA = {
  trace_name: "notrace_name",
  trace_id: "notrace_id",
  session_id: "nosession_id",
  trace_user_id: "nouser_id",
  generation_name: "nogeneration_name",
  business_objective: "nobusiness_objective"
};

export const getChatOpenAI = (() => {
  let instance: ChatOpenAI | null = null;

  return (metadata: typeof DEFAULT_METADATA = DEFAULT_METADATA) => {
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

    // Update the modelKwargs directly
    instance.modelKwargs = {
      ...instance.modelKwargs,
      metadata: metadata
    };

    return instance;
  };
})();