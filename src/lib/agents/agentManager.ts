import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ceoAgent } from "./ceoAgent";
import { ctoAgent } from "./ctoAgent";
import { cfoAgent } from "./cfoAgent";
import { cmoAgent } from "./cmoAgent";
import { cooAgent } from "./cooAgent";

interface AgentResponse {
  messages: AIMessage[];
}

interface CEODecision {
  decision: string;
  assignments: Record<string, string>;
}

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  situation: Annotation<string>(),
  userAdvice: Annotation<string>(),
  ceoDecision: Annotation<CEODecision | null>({
    default: () => null,
    value: (x, y) => y ?? x,
  }),
  completedAgents: Annotation<string[]>({
    default: () => [],
    reducer: (x, y) => Array.from(new Set([...x, ...y])),
  }),
});

function routeAgent(state: typeof AgentState.State): "CEO" | "C_SUITE" | typeof END {
  console.log("[routeAgent] Current state:", JSON.stringify(state, null, 2));
  
  if (state.completedAgents.length === 0) {
    console.log("[routeAgent] Starting with CEO");
    return "CEO";
  }
  
  if (state.completedAgents.length === 1) {
    console.log("[routeAgent] CEO completed, routing to C-Suite");
    return "C_SUITE";
  }
  
  if (state.completedAgents.length === 5) {
    console.log("[routeAgent] All agents completed, ending simulation");
    return END;
  }
  
  console.log("[routeAgent] Continuing C-Suite responses");
  return "C_SUITE";
}

const ceoNode = async (state: typeof AgentState.State) => {
  console.log("[ceoNode] Starting CEO node");
  try {
    const ceoResponse: AgentResponse = await ceoAgent({
      situation: state.situation,
      userAdvice: state.userAdvice,
      messages: state.messages,
    });
    console.log("[ceoNode] CEO response:", ceoResponse);

    if (!ceoResponse.messages || ceoResponse.messages.length === 0) {
      throw new Error("Invalid response from ceoAgent");
    }

    const content = ceoResponse.messages[0].content;
    console.log("[ceoNode] CEO message content:", content);

    let ceoDecision: CEODecision;
    try {
      ceoDecision = JSON.parse(content as string);
    } catch (parseError) {
      console.error("[ceoNode] Error parsing CEO message content:", parseError);
      throw new Error("Invalid JSON from CEO agent");
    }
    console.log("[ceoNode] Parsed CEO decision:", ceoDecision);

    return {
      messages: [new AIMessage({ content: content as string, name: "CEO" })],
      ceoDecision: ceoDecision,
      completedAgents: ["CEO"],
    };
  } catch (error) {
    console.error("[ceoNode] Error in CEO node:", error);
    throw error;
  }
};

const cSuiteNode = async (state: typeof AgentState.State) => {
  const cSuiteAgents: Record<string, (args: { situation: string; messages: AIMessage[] }) => Promise<AgentResponse>> = {
    CTO: ctoAgent,
    CFO: cfoAgent,
    CMO: cmoAgent,
    COO: cooAgent,
  };
  
  const newMessages: BaseMessage[] = [];
  const newCompletedAgents: string[] = [];
  
  for (const [role, agent] of Object.entries(cSuiteAgents)) {
    if (!state.completedAgents.includes(role) && state.ceoDecision) {
      const assignment = state.ceoDecision.assignments[role];
      const response = await agent({ situation: assignment, messages: state.messages });
      if (response.messages && response.messages.length > 0) {
        newMessages.push(new AIMessage({ content: response.messages[0].content as string, name: role }));
        newCompletedAgents.push(role);
      }
    }
  }
  
  return {
    messages: newMessages,
    completedAgents: newCompletedAgents,
  };
};

export async function* runSimulation(situation: string, userAdvice: string) {
  console.log("[runSimulation] Starting simulation");
  console.log("[runSimulation] Situation:", situation);
  console.log("[runSimulation] User advice:", userAdvice);

  const workflow = new StateGraph<typeof AgentState.State, "CEO" | "C_SUITE">(AgentState);

  console.log("[runSimulation] Adding nodes to workflow");
  workflow.addNode("CEO", ceoNode);
  workflow.addNode("C_SUITE", cSuiteNode);

  console.log("[runSimulation] Adding edges to workflow");
  workflow.addEdge("__start__", "CEO");
  
  workflow.addConditionalEdges(
    "CEO",
    routeAgent as (state: typeof AgentState.State) => "C_SUITE" | typeof END,
    {
      C_SUITE: "C_SUITE",
      [END]: END,
    }
  );
  
  workflow.addConditionalEdges(
    "C_SUITE",
    routeAgent as (state: typeof AgentState.State) => "C_SUITE" | typeof END,
    {
      C_SUITE: "C_SUITE",
      [END]: END,
    }
  );

  console.log("[runSimulation] Compiling graph");
  const graph = workflow.compile();

  console.log("[runSimulation] Invoking graph");
  try {
    const stream = await graph.stream({
      situation,
      userAdvice,
      messages: [],
      ceoDecision: null,
      completedAgents: [],
    }, {
      streamMode: "values",
    });

    for await (const chunk of stream) {
      console.log("[runSimulation] Received chunk:", JSON.stringify(chunk, null, 2));
      if (chunk.messages && chunk.messages.length > 0) {
        for (const message of chunk.messages) {
          console.log("[runSimulation] Yielding message:", JSON.stringify(message, null, 2));
          yield {
            role: message.name ? 'assistant' : 'system',
            content: message.content as string,
            name: message.name,
          };
        }
      } else {
        console.log("[runSimulation] Chunk does not contain messages");
      }
    }

    console.log("[runSimulation] Simulation complete.");
  } catch (error) {
    console.error("[runSimulation] Error invoking graph:", error);
    throw error;
  }
}

