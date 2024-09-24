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

// Remove duplicate or obsolete interfaces that are no longer used.
// For instance, if 'MessageContentComplex' is not used, it can be removed.

// Ensure that all components and functions import types from this single source.
// ... rest of the code ...

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'business_cycle' | 'simulation_group' | 'simulation';
  content: string;
  name?: string;
  type?: string; // Add this line
}

/**
 * Represents the Key Performance Indicators (KPIs) of the game.
 */
export interface KPI {
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}