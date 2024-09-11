import { StateGraph, START, END } from "@langchain/langgraph/web";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { saveGameState } from './localStorage';
import { GameState } from '@/types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Add logging for environment variables
console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('OPENAI_API_KEY set (process.env):', !!process.env.OPENAI_API_KEY);

// Define the tools
const searchTool = tool(async ({ query }: { query: string }) => {
  console.log("Search query:", query);
  return "Cold, with a low of 3℃";
}, {
  name: "search",
  description: "Use to surf the web, fetch current information, check the weather, and retrieve other information.",
  schema: z.object({
    query: z.string().describe("The query to use in your search."),
  }),
});

const tools = [searchTool];

// Add try-catch block for model instantiation
let model;
try {
  model = new ChatOpenAI({ modelName: "gpt-4-0125-preview", openAIApiKey: process.env.OPENAI_API_KEY });
  console.log('ChatOpenAI model instantiated successfully');
} catch (error) {
  console.error('Error instantiating ChatOpenAI model:', error);
  throw error;
}

const boundModel = model.bindTools(tools);
const toolNode = new ToolNode(tools);

// Update the type definition for the state
type State = {
  messages: BaseMessage[];
};

// Update the callModel function
const callModel = async (state: State) => {
  console.log('Calling model with state:', JSON.stringify(state, null, 2));
  try {
    const responseMessage = await boundModel.invoke(state.messages);
    console.log('Model response:', responseMessage);
    return { messages: [...state.messages, responseMessage] };
  } catch (error) {
    console.error('Error in callModel:', error);
    throw error;
  }
};

// Update the routeMessage function
const routeMessage = (state: State) => {
  console.log('Routing message, state:', JSON.stringify(state, null, 2));
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (!lastMessage?.tool_calls?.length) {
    console.log('No tool calls, returning END');
    return END;
  }
  console.log('Tool calls present, returning "tools"');
  return "tools";
};

// Update the workflow definition
const workflow = new StateGraph<State>({
  channels: {
    messages: z.array(z.any()),
  },
})
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", routeMessage)
  .addEdge("tools", "agent");

console.log('Workflow created');

const graph = workflow.compile();
console.log('Graph compiled');

export async function startNewGame(): Promise<GameState> {
  console.log('[api] Starting new game');
  try {
    const response = await fetch(`${API_BASE_URL}/api/newGame`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[api] Failed to start new game:', response.status, errorText);
      throw new Error(`Failed to start a new game: ${response.status} ${errorText}`);
    }
    const newGameState: GameState = await response.json();
    console.log('[api] New game state:', JSON.stringify(newGameState, null, 2));
    saveGameState(newGameState);
    return newGameState;
  } catch (error) {
    console.error('[api] Error in startNewGame:', error);
    throw error;
  }
}

export const simulateBusinessCycle = async (userInput: string) => {
  console.log('Simulating business cycle with input:', userInput);
  const inputs = { messages: [{ role: "user", content: userInput }] };
  let finalState;

  try {
    for await (const chunk of await graph.stream(inputs, { streamMode: "values" })) {
      console.log('[routeAgent] Current state:', JSON.stringify(chunk, null, 2));
      finalState = chunk;
    }
  } catch (error) {
    console.error('Error in simulateBusinessCycle:', error);
    throw error;
  }

  return finalState?.messages || [];
};

export async function generateScenario() {
  const response = await fetch('/api/generateScenario');
  return response.json();
}

export async function saveGame(gameState: GameState) {
  const response = await fetch('/api/saveGame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState),
  });
  return response.json();
}