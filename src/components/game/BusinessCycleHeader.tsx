import React from 'react';

interface BusinessCycleHeaderProps {
  cycleNumber: number;
}

const BusinessCycleHeader: React.FC<BusinessCycleHeaderProps> = ({ cycleNumber }) => {
  return (
    <div className="bg-black text-white p-3 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center">Business Cycle {cycleNumber}</h2>
    </div>
  );
};

export default BusinessCycleHeader;
