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

// properties = {
//   "$session_id": clean_metadata.get("session_id"),
//   "cost": kwargs.get("response_cost", 0),
//   "prompt": messages,
//   "system_message": extract_message_content(messages)[0],
//   "last_message": extract_message_content(messages)[1],
//   "response": extract_response_content(response_obj),
//   "business_objective": clean_metadata.get("business_objective", None),
//   "milestone": clean_metadata.get("milestone") or clean_metadata.get("trace_name", None),
//   "milestone_step": clean_metadata.get("milestone_step") or clean_metadata.get("generation_name", None),
//   "router_metadata": {
//       "model": kwargs.get("model", ""),
//       "response_time": response_time,
//       "cache_hit": cache_hit,
//       "call_type": call_type,
//       "model_group": kwargs.get("model_group"),
//       "tokens": usage,
//       "router_user": kwargs.get("user", ""),
//   },
//   "timestamp": end_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"  # ISO 8601 format with milliseconds
//   }

// posthog_user_id = clean_metadata.get("user_id") or clean_metadata.get("trace_user_id", None)  
// event_name = clean_metadata.get("event_name") or clean_metadata.get("milestone_step") or clean_metadata.get("generation_name", "")
// event_name = f"{event_name}_gen"
// if posthog_user_id is None:
//   properties['$process_person_profile']=False
// capture_id = posthog_user_id or str(uuid.uuid4())

// self.Posthog.capture(
//   capture_id, 
//   event_name, 
//   {
//       **properties
//   }
// )


// gameId: gameState.gameId,
// sessionId: gameState.sessionId,
// userId: gameState.userId,
// cycle: gameState.currentCycle,
// kpis: gameState.kpiHistory[gameState.kpiHistory.length - 1] || {},
// trace_id: uuidv4()

export const getChatOpenAI = (() => {
  let instance: ChatOpenAI | null = null;

  return (metadata: any) => {
    if (!instance) {
      const env = getServerSideEnv();
      console.log(env);
      instance = new ChatOpenAI({
        // openAIApiKey: env.OPENAI_API_KEY,
        openAIApiKey: "sk-SWEGTVLg6xizYG8vFeIo1w", //TODO remove this need to rebuild project but getting type errors
        modelName: "oaimini",
        temperature: 1.0,
        configuration: { 
          basePath: "https://route.flowguard.app" // Use basePath instead of baseURL
        },
        modelKwargs: {
          metadata: {}
        }
      });
    }

    const mappedMetadata = metadata ? Object.entries({
      trace_name: metadata.cycle ? `Cycle: ${metadata.cycle}` : undefined,
      trace_id: metadata.trace_id,
      session_id: metadata.sessionId,
      trace_user_id: metadata.userId,
      generation_name: metadata.inferenceObjective,
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