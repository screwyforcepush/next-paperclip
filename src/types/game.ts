export interface KPI {
  revenue: number;
  profitMargin: number;
  marketShare: number;
  innovationIndex: number;
  clvCacRatio: number;
  productionEfficiencyIndex: number;
  sharePrice: number;
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
  cycleNumber?: number;
}

export interface Change {
  revenue: number;
  profitMargin: number;
  marketShare: number;
  innovationIndex: number;
  clvCacRatio: number;
  productionEfficiencyIndex: number;
}

export interface Order {
  persona: string;
  action: 'Buy' | 'Sell';
  reason: string;
  orderSize?: number; // Optional property for order size
}