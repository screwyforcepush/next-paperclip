"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const GameHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h1 className="text-2xl font-bold">
          Universal Paperclips - Business Advice Simulation
        </h1>
        {isOpen ? (
          <ChevronUpIcon className="h-6 w-6 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 flex-shrink-0" />
        )}
      </div>
      {isOpen && (
        <div className="mt-4 p-4 bg-gray-700 rounded-md">
          {/* Business Overview content will go here */}
          <p>Business Overview placeholder</p>
        </div>
      )}
    </header>
  );
};

export default GameHeader;
