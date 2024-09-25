import React from 'react';
import { Card, Flex, Text, AreaChart } from '@tremor/react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPIChartProps {
  title: string;
  data: any[];
  category: string;
  color: string;
  valueFormatter: (value: number) => string;
}

const KPIChart: React.FC<KPIChartProps> = ({ title, data, category, color, valueFormatter }) => {
  const chartColors = {
    blue: 'blue',
    green: 'emerald',
    orange: 'orange',
    purple: 'violet',
    red: 'rose',
    cyan: 'cyan',
  };

  const currentValue = data[data.length - 1][category];
  const previousValue = data[data.length - 2]?.[category] ?? currentValue;
  const firstValue = data[0][category];

  const changeFromPrevious = ((currentValue - previousValue) / previousValue) * 100;
  const changeFromFirst = ((currentValue - firstValue) / firstValue) * 100;

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
    <Card className="bg-gray-800 border border-gray-700 shadow-lg p-3">
      <Flex flexDirection="col" alignItems="start" className="space-y-1">
        <Text className="text-sm font-bold text-gray-300">{title}</Text>
        <Text className="text-xl font-semibold text-white">{valueFormatter(currentValue)}</Text>
        <Flex justifyContent="between" className="w-full text-xs text-gray-400">
          <Text>Prev:</Text>
          {formatChange(changeFromPrevious)}
        </Flex>
        <Flex justifyContent="between" className="w-full text-xs text-gray-400">
          <Text>Total:</Text>
          {formatChange(changeFromFirst)}
        </Flex>
      </Flex>
      <AreaChart
        className="h-16 mt-2"
        data={data}
        index="cycle"
        categories={[category]}
        colors={[chartColors[color as keyof typeof chartColors]]}
        valueFormatter={valueFormatter}
        showXAxis={false}
        showYAxis={false}
        showLegend={false}
        showGridLines={false}
        showAnimation={true}
        curveType="monotone"
      />
    </Card>
  );
};

export default KPIChart;
