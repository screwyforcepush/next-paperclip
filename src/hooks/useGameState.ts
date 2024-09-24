import { useContext } from 'react';
import { GameStateContext } from '@/contexts/GameStateContext';

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}