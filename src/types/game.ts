export interface KPIs {
  revenue: number;
  profitMargin: number;
  clvCacRatio: number;
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

export interface Message {
  role: string;
  content: string;
  name?: string;
  cycleNumber?: number; // Include this property
}

export interface KPI {
  revenue: number;
  profitMargin: number;
  clvCacRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}