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
    } else {
      setIsOpen(false);
    }
  }, [isSimulating]);

  useEffect(() => {
    if (isOpen && isSimulating) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSimulating]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="my-4 border border-gray-700 rounded-lg overflow-hidden">
      <div
        className={`flex items-center justify-between cursor-pointer bg-gray-800 p-3 transition-colors duration-200 ${isOpen ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        onClick={toggleAccordion}
      >
        <div className="text-gray-200 text-sm font-medium flex items-center">
          <svg className={`w-5 h-5 mr-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Business Simulation
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-900 overflow-hidden"
          >
            <div className="p-4 space-y-3">
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
