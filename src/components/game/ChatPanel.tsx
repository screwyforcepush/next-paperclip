'use client';

import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameStateLoader } from '@/hooks/useGameStateLoader';
import { useMessageHandler } from '@/hooks/useMessageHandler';
import MessageBubble from './MessageBubble';
import BusinessCycleHeader from './BusinessCycleHeader';
import SimulationAccordion from './SimulationAccordion';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel: React.FC = () => {
  const { gameState } = useGameState();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { loading, error, handleNewGame } = useGameStateLoader();
  const { handleSubmit, isSimulating } = useMessageHandler(input, setInput);

  // Group simulation messages by cycleNumber
  const groupedSimulations = useMemo(() => {
    const groups: Record<number, Message[]> = {};
    gameState.messages.forEach((message) => {
      if (message.role === 'simulation') {
        const cycle = message.cycleNumber || 0;
        if (!groups[cycle]) {
          groups[cycle] = [];
        }
        groups[cycle].push(message);
      }
    });
    return groups;
  }, [gameState.messages]);

  useLayoutEffect(() => {
    console.log('[ChatPanel] Game state updated:', gameState);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages, isSimulating]);

  console.log('[ChatPanel] Rendering. Current game state:', gameState);
  console.log('[ChatPanel] isSimulating:', isSimulating, 'currentCycle:', gameState.currentCycle);

  return (
    <div className="chat-panel flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleNewGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Start New Game
            </button>
          </div>
        ) : gameState.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-red-500">No messages yet. Start a new game or provide advice.</div>
        ) : (
          <AnimatePresence initial={false}>
            {(() => {
              const elements = [];
              const messages = gameState.messages;
              let index = 0;

              while (index < messages.length) {
                const message = messages[index];

                if (message.role === 'business_cycle') {
                  const currentCycleNumber = parseInt(message.content, 10);
                  elements.push(
                    <BusinessCycleHeader key={`cycle-${index}`} cycleNumber={currentCycleNumber} />
                  );
                  index++;
                } else if (message.role === 'simulation_group') {
                  const cycleNumber = messages[index + 1]?.cycleNumber || 0;
                  const simulationMessages = groupedSimulations[cycleNumber] || [];
                  elements.push(
                    <SimulationAccordion
                      key={`sim-${cycleNumber}`}
                      messages={simulationMessages}
                      cycleNumber={cycleNumber}
                      isSimulating={isSimulating && cycleNumber === gameState.currentCycle}
                    />
                  );
                  index += simulationMessages.length + 1;
                } else {
                  elements.push(
                    <MessageBubble key={`msg-${index}`} message={message} />
                  );
                  index++;
                }
              }
              return elements.map((element, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onAnimationComplete={() => {
                    if (index === elements.length - 1) {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {element}
                </motion.div>
              ));
            })()}
          </AnimatePresence>
        )}
        {isSimulating && gameState.currentCycle && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-blue-500">Simulating</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-l-full rounded-r-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Type your advice..."
            disabled={isSimulating}
          />
          <button
            type="submit"
            className={`text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out ${
              input.trim() && !isSimulating
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
            disabled={!input.trim() || isSimulating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
