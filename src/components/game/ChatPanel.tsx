'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import MessageBubble from './MessageBubble';
import { startNewGame, simulateBusinessCycle } from '@/lib/utils/api';
import { Message } from '@/types/game';

const ChatPanel: React.FC = () => {
  const { gameState, setGameState } = useGameState();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameState) {
      handleNewGame();
    }
  }, [gameState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.messages]);

  const handleNewGame = async () => {
    setLoading(true);
    try {
      const newGameState = await startNewGame();
      setGameState(newGameState);
    } catch (error) {
      console.error('Failed to start new game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !gameState) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setGameState(prevState => ({
      ...prevState!,
      messages: [...prevState!.messages, userMessage],
    }));
    setInput('');

    try {
      const newMessages = await simulateBusinessCycle(input);
      setGameState(prevState => ({
        ...prevState!,
        messages: [...prevState!.messages, ...newMessages.slice(1)],
      }));
    } catch (error) {
      console.error('Error simulating business cycle:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!gameState) {
    return <div className="flex items-center justify-center h-full text-red-500">No game state available</div>;
  }

  return (
    <div className="chat-panel flex flex-col h-[calc(100vh-7rem)] bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {gameState?.messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
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
