import React, { useState, useEffect } from 'react';
import { Card, Title, Text, LineChart } from "@tremor/react";
import { useGameState } from '@/contexts/GameStateContext';

interface CompanyOverviewProps {
  companyName: string;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ companyName }) => {
  const [isClient, setIsClient] = useState(false);
  const { gameState } = useGameState();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentCycle = isClient ? gameState.currentCycle : 0;
  const latestSharePrice = isClient && gameState.kpiHistory.length > 0
    ? gameState.kpiHistory[gameState.kpiHistory.length - 1].revenue / 1000
    : 0;

  const data = isClient ? gameState.kpiHistory.map((kpi, index) => ({
    cycle: index + 1,
    price: kpi.revenue / 1000
  })) : [];

  return (
    <Card className="bg-gray-800 border border-gray-700 shadow-lg">
      <Title className="text-2xl font-bold text-white mb-2">{companyName}</Title>
      <div className="flex justify-between items-center mb-4">
        <Text className="text-gray-400">Current Business Cycle: <span className="text-white font-semibold">{isClient ? currentCycle : '...'}</span></Text>
        <Text className="text-gray-400">Share Price: <span className="text-white font-semibold">${isClient ? latestSharePrice.toFixed(2) : '...'}</span></Text>
      </div>
      {isClient && (
        <LineChart
          className="h-72"
          data={data}
          index="cycle"
          categories={["price"]}
          colors={["blue"]}
          valueFormatter={(value) => `$${value.toFixed(2)}`}
          yAxisWidth={48}
          showLegend={false}
        />
      )}
    </Card>
  );
};

export default CompanyOverview;
