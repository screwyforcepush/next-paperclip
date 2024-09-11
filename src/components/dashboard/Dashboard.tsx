import React from 'react';
import CompanyOverview from './CompanyOverview';
import KPIChart from './KPIChart';
import { useGameState } from '../../context/GameContext';

export interface KPIData {
  cycle: number;
  revenue: number;
  profitMargin: number;
  cacClvRatio: number;
  productionEfficiency: number;
  marketShare: number;
  innovationIndex: number;
}

interface DashboardProps {
  kpiData: KPIData[];
  companyName: string;
  currentCycle: number;
  sharePrice: number[];
}

const Dashboard: React.FC = () => {
  const { state } = useGameState();
  const { kpiHistory, currentCycle } = state;

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <CompanyOverview 
          companyName="PaperClip Inc."
          currentCycle={currentCycle}
          sharePrice={kpiHistory.map(kpi => kpi.revenue / 1000)} // Simplified share price calculation
        />
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
          valueFormatter={(value) => `${value.toFixed(2)}%`}
        />
        <KPIChart
          title="CAC/CLV Ratio"
          data={kpiHistory}
          category="cacClvRatio"
          color="orange"
          valueFormatter={(value) => value.toFixed(2)}
        />
        <KPIChart
          title="Production Efficiency"
          data={kpiHistory}
          category="productionEfficiency"
          color="purple"
          valueFormatter={(value) => value.toFixed(2)}
        />
        <KPIChart
          title="Market Share"
          data={kpiHistory}
          category="marketShare"
          color="red"
          valueFormatter={(value) => `${value.toFixed(2)}%`}
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
  );
};

export default Dashboard;
