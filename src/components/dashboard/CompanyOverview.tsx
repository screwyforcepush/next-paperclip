import React, { useState, useEffect } from 'react';
import { Card, Title, Text, LineChart, Flex } from "@tremor/react";
import { useGameState } from '@/contexts/GameStateContext';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

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
  const kpiHistory = isClient ? gameState.kpiHistory : [];
  const latestSharePrice = kpiHistory.length > 0 ? kpiHistory[kpiHistory.length - 1].revenue / 1000 : 0;
  const previousSharePrice = kpiHistory.length > 1 ? kpiHistory[kpiHistory.length - 2].revenue / 1000 : latestSharePrice;
  const firstSharePrice = kpiHistory.length > 0 ? kpiHistory[0].revenue / 1000 : latestSharePrice;

  const changeFromPrevious = ((latestSharePrice - previousSharePrice) / previousSharePrice) * 100;
  const changeFromFirst = ((latestSharePrice - firstSharePrice) / firstSharePrice) * 100;

  const data = kpiHistory.map((kpi, index) => ({
    cycle: index + 1,
    price: kpi.revenue / 1000
  }));

  const formatChange = (change: number) => {
    const formattedChange = Math.abs(change).toFixed(2);
    const textColor = change > 0 ? 'text-green-500' : 'text-red-500';
    return (
      <Flex justifyContent="start" alignItems="center" className={textColor}>
        {change > 0 ? (
          <ArrowUpIcon className="w-3 h-3 mr-1" />
        ) : (
          <ArrowDownIcon className="w-3 h-3 mr-1" />
        )}
        <Text className="text-xs">{formattedChange}%</Text>
      </Flex>
    );
  };

  return (
    <Card className="bg-gray-900 border border-purple-700 shadow-lg">
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title className="text-2xl font-bold text-purple-300 mb-2">{companyName}</Title>
          <Text className="text-gray-300">Current Business Cycle: <span className="text-white font-semibold">{isClient ? currentCycle : '...'}</span></Text>
          <Text className="text-gray-300">Share Price: <span className="text-white font-semibold">${isClient ? latestSharePrice.toFixed(2) : '...'}</span></Text>
          <Flex justifyContent="between" className="w-full text-xs text-gray-400 mt-1">
            <Text>Prev:</Text>
            {isClient && formatChange(changeFromPrevious)}
          </Flex>
          <Flex justifyContent="between" className="w-full text-xs text-gray-400">
            <Text>Total:</Text>
            {isClient && formatChange(changeFromFirst)}
          </Flex>
        </div>
        {isClient && (
          <LineChart
            className="h-48 w-2/3"
            data={data}
            index="cycle"
            categories={["price"]}
            colors={["purple"]}
            valueFormatter={(value) => `$${value.toFixed(2)}`}
            yAxisWidth={60}
            showLegend={false}
            curveType="monotone"
            theme={{
              chart: { backgroundColor: 'transparent' },
              axis: { stroke: '#4B5563' },
              grid: { stroke: '#374151' },
              tooltip: { backgroundColor: '#1F2937', color: '#F3F4F6' },
            }}
          />
        )}
      </Flex>
    </Card>
  );
};

export default CompanyOverview;
