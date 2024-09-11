import React from 'react';
import CompanyOverview from './CompanyOverview';
import KPIChart from './KPIChart';

interface KPIData {
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

const Dashboard: React.FC<DashboardProps> = ({ kpiData, companyName, currentCycle, sharePrice }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <CompanyOverview 
        companyName={companyName}
        currentCycle={currentCycle}
        sharePrice={sharePrice}
      />
      <KPIChart
        title="Revenue"
        data={kpiData}
        category="revenue"
        color="blue"
        valueFormatter={(value) => `$${value.toLocaleString()}`}
      />
      <KPIChart
        title="Profit Margin"
        data={kpiData}
        category="profitMargin"
        color="green"
        valueFormatter={(value) => `${value.toFixed(2)}%`}
      />
      <KPIChart
        title="CAC/CLV Ratio"
        data={kpiData}
        category="cacClvRatio"
        color="orange"
        valueFormatter={(value) => value.toFixed(2)}
      />
      <KPIChart
        title="Production Efficiency Index"
        data={kpiData}
        category="productionEfficiency"
        color="purple"
        valueFormatter={(value) => value.toFixed(2)}
      />
      <KPIChart
        title="Market Share"
        data={kpiData}
        category="marketShare"
        color="red"
        valueFormatter={(value) => `${value.toFixed(2)}%`}
      />
      <KPIChart
        title="Innovation Index"
        data={kpiData}
        category="innovationIndex"
        color="cyan"
        valueFormatter={(value) => value.toFixed(2)}
      />
    </div>
  );
};

export default Dashboard;
