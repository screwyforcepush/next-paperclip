import { BaseMessage } from "@langchain/core/messages";

export interface KPIState {
  // Define your KPI properties here
}

export interface Decision {
  agent: string;
  action: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  type: 'system' | 'user' | 'ceo' | 'cto' | 'cfo' | 'cmo' | 'coo';
}

export interface GameState {
  currentCycle: number;
  currentSituation: string;
  kpiHistory: KPIState[];
  messages: Message[];
}

export type MessageContentComplex = string | { type: string; text: string };

export interface SimulationResult {
  gameState: GameState;
  messages: BaseMessage[];
}
