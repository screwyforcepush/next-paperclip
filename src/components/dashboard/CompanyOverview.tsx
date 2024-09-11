import React from 'react';
import { Card, Title, LineChart } from '@tremor/react';

interface CompanyOverviewProps {
  companyName: string;
  currentCycle: number;
  sharePrice: number[];
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ companyName, currentCycle, sharePrice }) => {
  const data = sharePrice.map((price, index) => ({
    cycle: index + 1,
    price: price
  }));

  return (
    <Card className="col-span-full">
      <Title>{companyName}</Title>
      <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Current Cycle: {currentCycle}
      </p>
      <LineChart
        className="mt-4 h-72"
        data={data}
        index="cycle"
        categories={["price"]}
        colors={["blue"]}
        valueFormatter={(value) => `$${value.toFixed(2)}`}
        yAxisWidth={48}
      />
    </Card>
  );
};

export default CompanyOverview;
