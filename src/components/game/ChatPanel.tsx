'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import MessageBubble from './MessageBubble';
import BusinessCycleHeader from './BusinessCycleHeader';
import { startNewGame } from '@/lib/utils/api';
import { Message } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { GameActionType } from '@/contexts/gameActionTypes';
import SimulationAccordion from './SimulationAccordion';

const ChatPanel: React.FC = () => {
  const { gameState, dispatch } = useGameState();
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[ChatPanel] Component mounted, current gameState:', gameState);
    if (gameState.messages.length === 0) {
      const savedState = loadGameState();
      if (savedState) {
        console.log('[ChatPanel] Loaded game state from local storage:', savedState);
        dispatch({ type: GameActionType.SetGameState, payload: savedState });
      } else {
        console.log('[ChatPanel] No saved state found, starting new game');
        handleNewGame();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('[ChatPanel] Game state updated:', gameState);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState]);

  const handleNewGame = async () => {
    setLoading(true);
    try {
      console.log('[ChatPanel] Starting new game');
      const newGameState = await startNewGame();
      console.log('[ChatPanel] New game state received:', newGameState);
      dispatch({ type: GameActionType.SetGameState, payload: newGameState });
      saveGameState(newGameState);
      console.log('[ChatPanel] New game state saved to local storage');
    } catch (error) {
      console.error('[ChatPanel] Failed to start new game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput || !gameState) return;

    console.log('[ChatPanel] Submitting user input:', userInput);
    const userMessage: Message = { role: 'user', content: userInput };
    dispatch({ type: GameActionType.AddMessage, payload: userMessage });
    setInput('');

    try {
      console.log('[ChatPanel] Simulating business cycle');
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, gameState }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const messages = chunk.split('\n').filter(Boolean);

        for (const message of messages) {
          try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'kpis') {
              console.log('[ChatPanel] Received KPI update:', parsedMessage.content);
              dispatch({ type: GameActionType.UpdateKPI, payload: parsedMessage.content });
            } else {
              // Handle simulation messages
              if (parsedMessage.role === 'simulation') {
                console.log('[ChatPanel] Received simulation message:', parsedMessage);
                dispatch({ type: GameActionType.AddMessage, payload: parsedMessage });
              } else if (parsedMessage.role === 'business_cycle') {
                const newCycle = parseInt(parsedMessage.content, 10);
                if (!isNaN(newCycle)) {
                  console.log('[ChatPanel] Updating current cycle to:', newCycle);
                  dispatch({ type: GameActionType.SetCurrentCycle, payload: newCycle });
                } else {
                  console.error('[ChatPanel] Invalid business cycle number:', parsedMessage.content);
                }
              } else {
                // Handle other message types
                dispatch({ type: GameActionType.AddMessage, payload: parsedMessage });
              }
            }
          } catch (error) {
            console.error('[ChatPanel] Error parsing message:', error, 'Raw message:', message);
          }
        }
      }

      console.log('[ChatPanel] Business cycle simulation complete');
    } catch (error) {
      console.error('[ChatPanel] Error simulating business cycle:', error);
      // Optionally provide user feedback here
    }
  };

  console.log('[ChatPanel] Rendering. Current game state:', gameState);

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
          (() => {
            const elements = [];
            const messages = gameState.messages;
            let index = 0;
            let currentCycleNumber = 0;

            while (index < messages.length) {
              const message = messages[index];
              console.log(`[ChatPanel] Rendering message ${index}:`, message);

              if (message.role === 'business_cycle') {
                currentCycleNumber = parseInt(message.content, 10);
                elements.push(
                  <BusinessCycleHeader key={index} cycleNumber={currentCycleNumber} />
                );
                index++;
              } else if (message.role === 'simulation_group') {
                // Start collecting simulation messages
                const simulationMessages = [];
                index++; // Skip the 'simulation_group' message
                while (
                  index < messages.length &&
                  messages[index].role === 'simulation'
                ) {
                  simulationMessages.push(messages[index]);
                  index++;
                }
                elements.push(
                  <SimulationAccordion
                    key={index}
                    messages={simulationMessages}
                    cycleNumber={currentCycleNumber}
                  />
                );
              } else {
                elements.push(
                  <MessageBubble key={index} message={message} />
                );
                index++;
              }
            }

            return elements;
          })()
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your advice..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
