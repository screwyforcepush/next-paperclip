export interface KPIState {
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}

export interface Decision {
  agent: string;
  action: string;
}

export interface GameState {
  currentCycle: number;
  currentSituation: string;
  kpiHistory: KPI[];
  messages: Message[];
}

export type MessageContentComplex = string | { text: string };

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface KPI {
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}