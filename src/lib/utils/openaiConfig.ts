import { ChatOpenAI } from "@langchain/openai";
import { getServerSideEnv } from '@/lib/env';

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

  return (metadata?: any) => {
    if (!instance) {
      const env = getServerSideEnv();
      instance = new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        modelName: "oaimini",
        temperature: 1.0,
        configuration: { 
          basePath: env.LITELLM_BASE_PATH // Use basePath instead of baseURL
        },
        modelKwargs: {
          metadata: {}
        }
      });
    }

    const mappedMetadata = metadata ? Object.entries({
      trace_name: metadata.cycle ? `Cycle: ${metadata.cycle}` : undefined, //milestone
      trace_id: metadata.trace_id,
      session_id: metadata.sessionId, 
      trace_user_id: metadata.userId,
      generation_name: metadata.inferenceObjective, //milestone_step
      business_objective: metadata.gameId ? `Game ID: ${metadata.gameId}` : undefined,
      kpis: metadata.kpis //TODO handle this in litellm
    }).reduce((acc, [key, value]) => value !== undefined ? { ...acc, [key]: value } : acc, {}) : {};

    // Update the modelKwargs directly
    instance.modelKwargs = {
      ...instance.modelKwargs,
      metadata: {
        ...DEFAULT_METADATA,
        ...mappedMetadata
      }
    };

    return instance;
  };
})();