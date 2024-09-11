import React from 'react';
import { Card, Title, AreaChart } from '@tremor/react';

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

  return (
    <Card>
      <Title>{title}</Title>
      <AreaChart
        className="h-72 mt-4"
        data={data}
        index="cycle"
        categories={[category]}
        colors={[chartColors[color as keyof typeof chartColors]]}
        valueFormatter={valueFormatter}
        yAxisWidth={60}
      />
    </Card>
  );
};

export default KPIChart;
