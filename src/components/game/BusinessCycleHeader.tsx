import React from 'react';

interface BusinessCycleHeaderProps {
  cycleNumber: number;
}

const BusinessCycleHeader: React.FC<BusinessCycleHeaderProps> = ({ cycleNumber }) => {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow border-t border-gray-300"></div>
      <div className="px-4 text-gray-500 text-sm font-medium">
        Business Cycle {cycleNumber}
      </div>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};

export default BusinessCycleHeader;
