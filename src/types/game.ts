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

// Remove duplicate or obsolete interfaces that are no longer used.
// For instance, if 'MessageContentComplex' is not used, it can be removed.

// Ensure that all components and functions import types from this single source.
// ... rest of the code ...

export interface Message {
  role: string;
  content: string;
  name?: string;
  cycleNumber?: number; // Include this property
}

/**
 * Represents the Key Performance Indicators (KPIs) of the game.
 */
export interface KPI {
  revenue: number;
  profitMargin: number;
  clvCacRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}