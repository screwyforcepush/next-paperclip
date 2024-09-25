import React from 'react';

interface BusinessCycleHeaderProps {
  cycleNumber: number;
}

const BusinessCycleHeader: React.FC<BusinessCycleHeaderProps> = ({ cycleNumber }) => {
  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-700"></div>
      <div className="px-4 text-indigo-400 text-sm font-medium bg-gray-800 rounded-full py-1">
        Business Cycle {cycleNumber}
      </div>
      <div className="flex-grow border-t border-gray-700"></div>
    </div>
  );
};

export default BusinessCycleHeader;
