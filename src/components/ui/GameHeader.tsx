"use client";

import React, { useState } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { startNewGame } from '@/lib/utils/api';

const GameHeader: React.FC = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useGameState();

  const handleNewGame = async () => {
    setIsLoading(true);
    try {
      console.log('[GameHeader] Starting new game');
      const newGameState = await startNewGame();
      console.log('[GameHeader] New game state received:', newGameState);
      dispatch({ type: 'SET_GAME_STATE', payload: newGameState });
    } catch (error) {
      console.error('[GameHeader] Failed to start new game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Universal Paperclips - Business Advice Simulation</h1>
        <button
          onClick={handleNewGame}
          disabled={isLoading}
          className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Starting...' : 'New Game'}
        </button>
      </div>
      <button 
        onClick={() => setIsOverviewOpen(!isOverviewOpen)}
        className="mt-2 text-sm underline"
      >
        {isOverviewOpen ? 'Hide' : 'Show'} Business Overview
      </button>
      {isOverviewOpen && (
        <div className="mt-2 text-sm">
          {/* Add business overview content here */}
          Business overview content goes here...
        </div>
      )}
    </header>
  );
};

export default GameHeader;
