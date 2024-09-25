import React from 'react';
import CompanyOverview from './CompanyOverview';
import KPIChart from './KPIChart';
import { useGameState } from '@/contexts/GameStateContext';

export interface KPIData {
  cycle: number;
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}

const Dashboard: React.FC = () => {
  const { gameState } = useGameState();
  const { kpiHistory, currentCycle } = gameState || { kpiHistory: [], currentCycle: 0 };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <CompanyOverview 
          companyName="PaperClip Inc."
          currentCycle={currentCycle}
          sharePrice={kpiHistory.map(kpi => kpi.revenue / 1000)}
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <KPIChart
            title="Revenue"
            data={kpiHistory}
            category="revenue"
            color="blue"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <KPIChart
            title="Profit Margin"
            data={kpiHistory}
            category="profitMargin"
            color="green"
            valueFormatter={(value) => `${(value * 100).toFixed(2)}%`}
          />
          <KPIChart
            title="CLV/CAC Ratio"
            data={kpiHistory}
            category="clvCacRatio"
            color="orange"
            valueFormatter={(value) => value.toFixed(2)}
          />
          <KPIChart
            title="Production Efficiency"
            data={kpiHistory}
            category="productionEfficiencyIndex"
            color="purple"
            valueFormatter={(value) => value.toFixed(2)}
          />
          <KPIChart
            title="Market Share"
            data={kpiHistory}
            category="marketShare"
            color="red"
            valueFormatter={(value) => `${(value * 100).toFixed(2)}%`}
          />
          <KPIChart
            title="Innovation Index"
            data={kpiHistory}
            category="innovationIndex"
            color="cyan"
            valueFormatter={(value) => value.toFixed(2)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
