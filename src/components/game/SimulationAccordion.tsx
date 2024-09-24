import React, { useState, useEffect } from 'react';
import { Message } from '@/types/game';
import MessageBubble from './MessageBubble';

interface SimulationAccordionProps {
  messages: Message[];
  cycleNumber: number;
  isSimulating: boolean;
}

const SimulationAccordion: React.FC<SimulationAccordionProps> = ({ messages, cycleNumber, isSimulating }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSimulating) {
      setIsOpen(true); // Open accordion when simulation starts
    } else {
      setIsOpen(false); // Close accordion when simulation ends
    }
  }, [isSimulating]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="my-4">
      <div
        className="flex items-center cursor-pointer bg-gray-800 p-2 rounded-t"
        onClick={toggleAccordion}
      >
        <div className="flex-grow border-t border-gray-600"></div>
        <div className="px-4 text-gray-200 text-sm font-medium">
          Simulation {cycleNumber} {isOpen ? '▼' : '▶'}
        </div>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
      {isOpen && (
        <div className="bg-gray-700 p-4 rounded-b">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationAccordion;
