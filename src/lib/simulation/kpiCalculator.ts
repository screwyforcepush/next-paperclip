import { KPI } from '@/types/game';

export function calculateNewKPIs(currentKPIs: KPI, inputAnalysis: { [key: string]: number }): KPI {
  const newKPIs: KPI = {
    revenue: applyChange(currentKPIs.revenue, inputAnalysis.revenue, 0.1),
    profitMargin: applyChange(currentKPIs.profitMargin, inputAnalysis.profitMargin, 0.05, 0, 1),
    cacClvRatio: applyChange(currentKPIs.cacClvRatio, inputAnalysis.cacClvRatio, 0.1, 0),
    productionEfficiencyIndex: applyChange(currentKPIs.productionEfficiencyIndex, inputAnalysis.productionEfficiencyIndex, 0.05, 0, 1),
    marketShare: applyChange(currentKPIs.marketShare, inputAnalysis.marketShare, 0.02, 0, 1),
    innovationIndex: applyChange(currentKPIs.innovationIndex, inputAnalysis.innovationIndex, 0.05, 0, 1),
  };

  return newKPIs;
}

function applyChange(current: number, change: number, maxChange: number, min?: number, max?: number): number {
  const randomFactor = 1 + (Math.random() - 0.5) * 0.2; // Random factor between 0.9 and 1.1
  const newValue = current * (1 + change * maxChange * randomFactor);
  
  if (min !== undefined && max !== undefined) {
    return Math.max(min, Math.min(max, newValue));
  } else if (min !== undefined) {
    return Math.max(min, newValue);
  } else if (max !== undefined) {
    return Math.min(max, newValue);
  }
  
  return newValue;
}
