export interface GameState {
  cycle: number;
  company: {
    name: string;
    funds: number;
  };
  kpis: {
    revenue: number;
    profitMargin: number;
    cacClvRatio: number;
    productionEfficiencyIndex: number;
    marketShare: number;
    innovationIndex: number;
  };
}
