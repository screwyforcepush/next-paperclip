'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import MessageBubble from './MessageBubble';
import BusinessCycleHeader from './BusinessCycleHeader';
import { startNewGame } from '@/lib/utils/api';
import { Message } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { GameActionType } from '@/contexts/GameStateContext';

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
        dispatch({ type: 'SET_GAME_STATE', payload: savedState });
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
      dispatch({ type: 'SET_GAME_STATE', payload: newGameState });
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
    if (!input.trim() || !gameState) return;

    console.log('[ChatPanel] Submitting user input:', input);
    const userMessage: Message = { role: 'user', content: input.trim() };
    dispatch({ type: GameActionType.AddMessage, payload: userMessage });
    setInput('');

    try {
      console.log('[ChatPanel] Simulating business cycle');
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, gameState }),
      });

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
              dispatch({ type: GameActionType.AddMessage, payload: parsedMessage });
              
              // Handle business cycle update
              if (parsedMessage.role === 'business_cycle') {
                const newCycle = parseInt(parsedMessage.content, 10);
                if (!isNaN(newCycle)) {
                  console.log('[ChatPanel] Updating current cycle to:', newCycle);
                  dispatch({ type: GameActionType.SetCurrentCycle, payload: newCycle });
                } else {
                  console.error('[ChatPanel] Invalid business cycle number:', parsedMessage.content);
                }
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
          gameState.messages.map((message, index) => {
            console.log(`[ChatPanel] Rendering message ${index}:`, message);
            return (
              <React.Fragment key={index}>
                {message.role === 'business_cycle' ? (
                  <BusinessCycleHeader cycleNumber={parseInt(message.content)} />
                ) : (
                  <MessageBubble message={message} />
                )}
              </React.Fragment>
            );
          })
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
