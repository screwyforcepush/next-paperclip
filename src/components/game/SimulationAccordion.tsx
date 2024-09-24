import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/game';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationAccordionProps {
  messages: Message[];
  cycleNumber: number;
  isSimulating: boolean;
}

const SimulationAccordion: React.FC<SimulationAccordionProps> = ({ messages, cycleNumber, isSimulating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSimulating) {
      setIsOpen(true);
      console.log(`[SimulationAccordion] Opening accordion for cycle ${cycleNumber}`);
    } else {
      setIsOpen(false);
      console.log(`[SimulationAccordion] Closing accordion for cycle ${cycleNumber}`);
    }
  }, [isSimulating]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
    console.log(`[SimulationAccordion] Toggling accordion for cycle ${cycleNumber} to ${!isOpen}`);
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
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-700 overflow-hidden rounded-b"
            onAnimationComplete={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="p-4">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulationAccordion;
