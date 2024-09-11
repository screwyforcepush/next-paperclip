'use client';

import React, { useState, useEffect } from 'react';
import { simulateBusinessCycle } from '@/lib/utils/api';
import MessageBubble from './MessageBubble';
import { Message } from '@/types/game';
import { useGameState } from '@/context/GameContext';

export default function ChatPanel() {
  const { state, dispatch } = useGameState();
  const [userInput, setUserInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'User',
      content: userInput,
      type: 'user'
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    try {
      const simulationResult = await simulateBusinessCycle(userInput);
      
      // Add simulation messages
      simulationResult.messages.forEach((msg) => {
        const newMessage: Message = {
          id: `${msg.name}-${Date.now()}`,
          sender: msg.name || 'System',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          type: (msg.name?.toLowerCase() as Message['type']) || 'system'
        };
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      });

      // Update game state
      dispatch({ type: 'SET_CURRENT_CYCLE', payload: simulationResult.gameState.currentCycle });
      dispatch({ type: 'SET_CURRENT_SITUATION', payload: simulationResult.gameState.currentSituation });
      // Add other state updates as needed

      setUserInput('');
    } catch (error) {
      console.error('Error during simulation:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {state.messages.length > 0 ? (
          state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <p className="text-gray-500">No messages yet. Start the game to begin.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your advice..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Send Advice
        </button>
      </form>
    </div>
  );
}
