'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GameState } from '@/types/game';

interface GameStateContextType {
  gameState: GameState | null;
  setGameState: (newState: GameState | null) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameStateInternal] = useState<GameState | null>(null);

  console.log('[GameStateContext] Current game state:', gameState);

  const setGameState = useCallback((newState: GameState | null) => {
    console.log('[GameStateContext] Updating game state:', newState);
    setGameStateInternal(newState);
  }, []);

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}