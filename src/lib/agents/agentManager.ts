import { StateGraph, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ceoAgent } from "./ceoAgent";
import { ctoAgent } from "./ctoAgent";
import { cfoAgent } from "./cfoAgent";
import { cmoAgent } from "./cmoAgent";
import { cooAgent } from "./cooAgent";
import { MessageContentComplex } from "../../types/game";

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  situation: Annotation<string>(),
  userAdvice: Annotation<string>(),
});

function routeAgent(state: typeof AgentState.State) {
  console.log("[routeAgent] Current state:", JSON.stringify(state, null, 2));
  
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  console.log("[routeAgent] Last message:", JSON.stringify(lastMessage, null, 2));
  
  const content = lastMessage.content as MessageContentComplex;
  const contentString = typeof content === 'string' ? content : content.text;
  console.log("[routeAgent] Content string:", contentString);
  
  if (contentString.includes("FINAL DECISION")) {
    console.log("[routeAgent] Final decision reached, ending simulation");
    return END;
  }
  
  const agentOrder = ["CEO", "CTO", "CFO", "CMO", "COO"];
  const currentAgent = lastMessage.name || "";
  console.log("[routeAgent] Current agent:", currentAgent);
  
  const nextAgentIndex = (agentOrder.indexOf(currentAgent) + 1) % agentOrder.length;
  const nextAgent = agentOrder[nextAgentIndex];
  console.log("[routeAgent] Next agent:", nextAgent);
  
  return nextAgent;
}

export async function runSimulation(situation: string, userAdvice: string) {
  console.log("[runSimulation] Starting simulation");
  console.log("[runSimulation] Situation:", situation);
  console.log("[runSimulation] User advice:", userAdvice);

  const workflow = new StateGraph(AgentState);

  console.log("[runSimulation] Adding nodes to workflow");
  workflow.addNode("CEO", ceoAgent);
  workflow.addNode("CTO", ctoAgent);
  workflow.addNode("CFO", cfoAgent);
  workflow.addNode("CMO", cmoAgent);
  workflow.addNode("COO", cooAgent);

  console.log("[runSimulation] Adding edges to workflow");
  try {
    workflow.addConditionalEdges(
      "CEO",
      routeAgent,
      {
        CTO: "CTO",
        CFO: "CFO",
        CMO: "CMO",
        COO: "COO",
        [END]: END,
      }
    );
    console.log("[runSimulation] Added conditional edge for CEO");

    workflow.addConditionalEdges(
      "CTO",
      routeAgent,
      {
        CEO: "CEO",
        CFO: "CFO",
        CMO: "CMO",
        COO: "COO",
        [END]: END,
      }
    );
    console.log("[runSimulation] Added conditional edge for CTO");

    workflow.addConditionalEdges(
      "CFO",
      routeAgent,
      {
        CEO: "CEO",
        CTO: "CTO",
        CMO: "CMO",
        COO: "COO",
        [END]: END,
      }
    );
    console.log("[runSimulation] Added conditional edge for CFO");

    workflow.addConditionalEdges(
      "CMO",
      routeAgent,
      {
        CEO: "CEO",
        CTO: "CTO",
        CFO: "CFO",
        COO: "COO",
        [END]: END,
      }
    );
    console.log("[runSimulation] Added conditional edge for CMO");

    workflow.addConditionalEdges(
      "COO",
      routeAgent,
      {
        CEO: "CEO",
        CTO: "CTO",
        CFO: "CFO",
        CMO: "CMO",
        [END]: END,
      }
    );
    console.log("[runSimulation] Added conditional edge for COO");
  } catch (error) {
    console.error("[runSimulation] Error adding edges:", error);
    throw error;
  }

  console.log("[runSimulation] Setting entry point");
  try {
    workflow.setEntryPoint("CEO");
    console.log("[runSimulation] Entry point set successfully");
  } catch (error) {
    console.error("[runSimulation] Error setting entry point:", error);
    throw error;
  }

  console.log("[runSimulation] Compiling graph");
  let graph;
  try {
    graph = workflow.compile();
    console.log("[runSimulation] Graph compiled successfully");
  } catch (error) {
    console.error("[runSimulation] Error compiling graph:", error);
    throw error;
  }

  console.log("[runSimulation] Invoking graph");
  try {
    const result = await graph.invoke({
      situation,
      userAdvice,
      messages: [],
    });
    console.log("[runSimulation] Simulation complete. Result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("[runSimulation] Error invoking graph:", error);
    throw error;
  }
}
