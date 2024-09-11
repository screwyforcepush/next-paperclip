"use client";

import React, { useState } from 'react';

const GameHeader: React.FC = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold">Universal Paperclips - Business Advice Simulation</h1>
      <button 
        onClick={() => setIsOverviewOpen(!isOverviewOpen)}
        className="mt-2 text-sm underline"
      >
        {isOverviewOpen ? 'Hide' : 'Show'} Business Overview
      </button>
      {isOverviewOpen && (
        <div className="mt-2 text-sm">
          {/* Add business overview content here */}
          Business overview content goes here...
        </div>
      )}
    </header>
  );
};

export default GameHeader;
