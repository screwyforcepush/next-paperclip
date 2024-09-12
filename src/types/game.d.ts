import { BaseMessage } from "@langchain/core/messages";

export interface KPIState {
  // Define your KPI properties here
}

export interface Decision {
  agent: string;
  action: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'business_cycle';
  content: string;
  name?: string;
}

export interface KPIs {
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}

export interface GameState {
  currentCycle: number;
  currentSituation: string;
  kpiHistory: KPIs[];
  messages: Message[];
}

export type MessageContentComplex = string | { type: string; text: string };

export interface SimulationResult {
  gameState: GameState;
  messages: BaseMessage[];
}
