import React from 'react';
import { Card, Title, LineChart } from '@tremor/react';

interface KPIDataPoint {
  cycle: number;
  [key: string]: number;
}

interface KPIChartProps {
  title: string;
  data: KPIDataPoint[];
  category: string;
  color: string;
  valueFormatter: (value: number) => string;
}

const KPIChart: React.FC<KPIChartProps> = React.memo(({ title, data, category, color, valueFormatter }) => {
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
});

KPIChart.displayName = 'KPIChart';

export default KPIChart;
