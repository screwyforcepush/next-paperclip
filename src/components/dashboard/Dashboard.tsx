'use client';

import React, { useState, useEffect } from 'react';
import CompanyOverview from './CompanyOverview';
import KPIChart from './KPIChart';
import { useGameState } from '@/contexts/GameStateContext';

export interface KPIData {
  cycle: number;
  revenue: number;
  profitMargin: number;
  clvCacRatio: number;
  productionEfficiencyIndex: number;
  marketShare: number;
  innovationIndex: number;
}

const Dashboard: React.FC = () => {
  const { gameState } = useGameState();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-full flex items-center justify-center text-white">Loading...</div>;
  }

  const { kpiHistory } = gameState || { kpiHistory: [] };
  const hasKPIData = kpiHistory.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <CompanyOverview 
          companyName="PaperClip Inc."
        />
        {hasKPIData ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <KPIChart
              title="Revenue"
              data={kpiHistory}
              category="revenue"
              color="purple"
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
              color="blue"
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
        ) : (
          <div className="mt-4 text-center text-gray-400">
            No KPI data available. Start a new game or complete a business cycle to see KPIs.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
