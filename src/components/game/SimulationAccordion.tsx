import React, { useState } from 'react';
import { Message } from './MessageBubble';
import MessageBubble from './MessageBubble';

interface SimulationAccordionProps {
  messages: Message[];
  cycleNumber: number;
}

const SimulationAccordion: React.FC<SimulationAccordionProps> = ({ messages, cycleNumber }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="my-4">
      <div
        className="flex items-center cursor-pointer bg-gray-100 p-2 rounded-t"
        onClick={toggleAccordion}
      >
        <div className="flex-grow border-t border-gray-300"></div>
        <div className="px-4 text-gray-700 text-sm font-medium">
          Business Simulation {cycleNumber} {isOpen ? '▼' : '▶'}
        </div>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      {isOpen && (
        <div className="bg-gray-50 p-4 rounded-b">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationAccordion;
