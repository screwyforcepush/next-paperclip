import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ceoAgent } from "./ceoAgent";
import { ctoAgent, cfoAgent, cmoAgent, cooAgent } from "./cSuiteAgents";

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

function routeAgent(state: typeof AgentState.State): "CEO" | "CTO" | "CFO" | "CMO" | "COO" | typeof END {
//   console.log("[routeAgent] Current state:", JSON.stringify(state, null, 2));
  
  if (state.completedAgents.length === 0) {
    console.log("[routeAgent] Starting with CEO");
    return "CEO";
  }
  
  if (state.completedAgents.includes("CEO")) {
    const cSuiteRoles = ["CTO", "CFO", "CMO", "COO"];
    for (const role of cSuiteRoles) {
      if (!state.completedAgents.includes(role)) {
        console.log(`[routeAgent] Routing to ${role}`);
        return role as "CTO" | "CFO" | "CMO" | "COO";
      }
    }
  }
  
  console.log("[routeAgent] All agents completed, ending simulation");
  return END;
}

const ceoNode = async (state: typeof AgentState.State) => {
  console.log("[ceoNode] Starting CEO node");
  try {
    const ceoResponse: CEODecision = await ceoAgent({
      situation: state.situation,
      userAdvice: state.userAdvice,
      messages: state.messages,
    });
    console.log("[ceoNode] CEO response:", ceoResponse);

    return {
      messages: [new AIMessage({ content: ceoResponse.decision, name: "CEO" })],
      ceoDecision: ceoResponse,
      completedAgents: ["CEO"],
    };
  } catch (error) {
    console.error("[ceoNode] Error in CEO node:", error);
    throw error;
  }
};

const createCSuiteNode = (role: string, agent: Function) => async (state: typeof AgentState.State) => {
  console.log(`[${role}Node] Starting ${role} node`);
  if (state.ceoDecision && state.ceoDecision.assignments[role]) {
    const assignment = state.ceoDecision.assignments[role];
    const response = await agent({ situation: assignment, messages: state.messages });
    console.log(`[${role}Node] assignment ${assignment} ${role} response:`, response.messages[0].content);
    return {
      messages: [new AIMessage({ content: response.messages[0].content as string, name: role })],
      completedAgents: [role],
    };
  }
  return { messages: [], completedAgents: [] };
};

export async function* runSimulation(situation: string, userAdvice: string) {
  console.log("[runSimulation] Starting simulation");
  console.log("[runSimulation] Situation:", situation);
  console.log("[runSimulation] User advice:", userAdvice);

  const workflow = new StateGraph<typeof AgentState.State, "CEO" | "CTO" | "CFO" | "CMO" | "COO">(AgentState);

  console.log("[runSimulation] Adding nodes to workflow");
  workflow.addNode("CEO", ceoNode);
  workflow.addNode("CTO", createCSuiteNode("CTO", ctoAgent));
  workflow.addNode("CFO", createCSuiteNode("CFO", cfoAgent));
  workflow.addNode("CMO", createCSuiteNode("CMO", cmoAgent));
  workflow.addNode("COO", createCSuiteNode("COO", cooAgent));

  console.log("[runSimulation] Adding edges to workflow");
  workflow.addEdge("__start__", "CEO");
  
  workflow.addConditionalEdges(
    "CEO",
    routeAgent as (state: typeof AgentState.State) => "CTO" | "CFO" | "CMO" | "COO" | typeof END,
    {
      CTO: "CTO",
      CFO: "CFO",
      CMO: "CMO",
      COO: "COO",
      [END]: END,
    }
  );
  
  for (const role of ["CTO", "CFO", "CMO", "COO"]) {
    workflow.addConditionalEdges(
      role as "CTO" | "CFO" | "CMO" | "COO",
      routeAgent as (state: typeof AgentState.State) => "CTO" | "CFO" | "CMO" | "COO" | typeof END,
      {
        CTO: "CTO",
        CFO: "CFO",
        CMO: "CMO",
        COO: "COO",
        [END]: END,
      }
    );
  }

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

    const yieldedMessages = new Set();

    for await (const chunk of stream) {
    //   console.log("[runSimulation] Received chunk:", JSON.stringify(chunk, null, 2));
      if (chunk.messages && chunk.messages.length > 0) {
        for (const message of chunk.messages) {
          const messageKey = `${message.name}-${message.content}`;
          if (!yieldedMessages.has(messageKey)) {
            console.log("[runSimulation] Yielding message:", message.name);
            yieldedMessages.add(messageKey);
            yield {
              role: message.name ? 'assistant' : 'system',
              content: message.content as string,
              name: message.name,
            };
          } else {
            console.log("[runSimulation] Skipping duplicate message:", message.name);
          }
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

