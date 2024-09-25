"use client";

import React, { useState } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { startNewGame } from '@/lib/utils/api';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import { BUSINESS_OVERVIEW } from '@lib/constants/business'; // Adjust the path as necessary

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
    <header className="bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Universal Paperclips</h1>
          <p className="text-sm text-gray-400">Business Advice Simulation</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 ease-in-out flex items-center"
          >
            Business Overview
            {isOverviewOpen 
              ? <ChevronUpIcon className="w-4 h-4 ml-1" />
              : <ChevronDownIcon className="w-4 h-4 ml-1" />
            }
          </button>
          <button
            onClick={handleNewGame}
            disabled={isLoading}
            className={`bg-red-600 text-white px-4 py-2 rounded text-sm font-medium
              ${isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900'
              }`}
          >
            {isLoading ? 'Starting...' : 'New Game'}
          </button>
        </div>
      </div>
      {isOverviewOpen && (
        <div className="mt-4 text-sm bg-gray-800 p-4 rounded border border-gray-700">
          <button 
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 ease-in-out flex items-center pb-5"
          >
            Business Overview
            {isOverviewOpen 
              ? <ChevronUpIcon className="w-4 h-4 ml-1" />
              : <ChevronDownIcon className="w-4 h-4 ml-1" />
            }
          </button>
          <ReactMarkdown 
            className="prose prose-sm prose-invert max-w-none"
            components={{
              p: ({node, ...props}) => <p className="mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {BUSINESS_OVERVIEW}
          </ReactMarkdown>
        </div>
      )}
    </header>
  );
};

export default GameHeader;
