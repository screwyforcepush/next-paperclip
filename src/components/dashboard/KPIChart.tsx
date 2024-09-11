import React from 'react';
import { Card, Title, LineChart } from '@tremor/react';

interface KPIChartProps {
  title: string;
  data: any[];
  category: string;
  color: string;
  valueFormatter: (value: number) => string;
}

const KPIChart: React.FC<KPIChartProps> = ({ title, data, category, color, valueFormatter }) => {
  return (
    <Card>
      <Title>{title}</Title>
      <LineChart
        className="mt-4 h-72"
        data={data}
        index="cycle"
        categories={[category]}
        colors={[color]}
        valueFormatter={valueFormatter}
        yAxisWidth={48}
      />
    </Card>
  );
};

export default KPIChart;
