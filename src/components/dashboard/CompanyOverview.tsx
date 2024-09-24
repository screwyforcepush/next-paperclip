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
    ? gameState.kpiHistory[gameState.kpiHistory.length - 1].revenue / 1000 // Assuming share price is revenue / 1000
    : 0;

  const data = isClient ? gameState.kpiHistory.map((kpi, index) => ({
    cycle: index + 1,
    price: kpi.revenue / 1000
  })) : [];

  return (
    <Card className="col-span-full">
      <Title>{companyName}</Title>
      <Text>Current Business Cycle: {isClient ? currentCycle : '...'}</Text>
      <Text>Share Price: ${isClient ? latestSharePrice.toFixed(2) : '...'}</Text>
      {isClient && (
        <LineChart
          className="mt-4 h-72"
          data={data}
          index="cycle"
          categories={["price"]}
          colors={["blue"]}
          valueFormatter={(value) => `$${value.toFixed(2)}`}
          yAxisWidth={48}
        />
      )}
    </Card>
  );
};

export default CompanyOverview;
