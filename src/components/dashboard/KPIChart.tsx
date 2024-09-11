import React from 'react';
import { LineChart, Card, Title } from '@tremor/react';
import { KPIData } from './Dashboard';

interface KPIChartProps {
  title: string;
  data: KPIData[];
  category: keyof KPIData;
  color: string;
  valueFormatter: (value: number) => string;
}

const KPIChart: React.FC<KPIChartProps> = ({ title, data, category, color, valueFormatter }) => {
  return (
    <Card>
      <Title>{title}</Title>
      <LineChart
        data={data}
        index="cycle"
        categories={[category]}
        colors={[color]}
        valueFormatter={valueFormatter}
        yAxisWidth={40}
      />
    </Card>
  );
};

export default KPIChart;
