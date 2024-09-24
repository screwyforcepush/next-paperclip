'use client';

import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState'; // Import the useGameState hook
import { useGameStateLoader } from '@/hooks/useGameStateLoader';
import { useMessageHandler } from '@/hooks/useMessageHandler'; // Added import for useMessageHandler
import MessageBubble from './MessageBubble';
import BusinessCycleHeader from './BusinessCycleHeader';
import SimulationAccordion from './SimulationAccordion';
import { motion, AnimatePresence } from 'framer-motion'; // Added import for motion

const ChatPanel: React.FC = () => {
  const { gameState } = useGameState();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { loading /*, handleNewGame */ } = useGameStateLoader(); // Removed handleNewGame
  const { handleSubmit, isSimulating } = useMessageHandler(input, setInput); // Removed currentCycle from destructure

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

  useLayoutEffect(() => { // Changed from useEffect to useLayoutEffect
    console.log('[ChatPanel] Game state updated:', gameState);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages, isSimulating]); // Added isSimulating to dependencies

  console.log('[ChatPanel] Rendering. Current game state:', gameState);
  console.log('[ChatPanel] isSimulating:', isSimulating, 'currentCycle:', gameState.currentCycle); // Log currentCycle from gameState

  return (
    <div className="chat-panel flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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
                // console.log(`[ChatPanel] Rendering message ${index}:`, message);

                if (message.role === 'business_cycle') {
                  const currentCycleNumber = parseInt(message.content, 10);
                  elements.push(
                    <BusinessCycleHeader key={`cycle-${index}`} cycleNumber={currentCycleNumber} />
                  );
                  index++;
                } else if (message.role === 'simulation_group') {
                  const cycleNumber = messages[index + 1]?.cycleNumber || 0; // Assuming cycleNumber is in the next message
                  const simulationMessages = groupedSimulations[cycleNumber] || [];
                  elements.push(
                    <SimulationAccordion
                      key={`sim-${cycleNumber}`}
                      messages={simulationMessages}
                      cycleNumber={cycleNumber}
                      isSimulating={isSimulating && cycleNumber === gameState.currentCycle}
                    />
                  );
                  index += simulationMessages.length + 1; // Skip the group header and its messages
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
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
            placeholder="Type your advice..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
            disabled={isSimulating}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
