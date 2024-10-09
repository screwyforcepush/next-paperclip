import { useEffect, useState } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { startNewGame } from '@/lib/utils/api';
import { GameActionType } from '@/contexts/gameActionTypes';

export const useGameStateLoader = () => {
  const { gameState, dispatch } = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useGameStateLoader] Component mounted, current gameState:', gameState);
    if (gameState.messages.length === 0) {
      const savedState = loadGameState();
      if (savedState) {
        console.log('[useGameStateLoader] Loaded game state from local storage:', savedState);
        dispatch({ type: GameActionType.SetGameState, payload: savedState });
      } else {
        console.log('[useGameStateLoader] No valid saved state found, starting new game');
        handleNewGame();
      }
    }
    setLoading(false);
  }, []);

  const handleNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useGameStateLoader] Starting new game');
      const newGameState = await startNewGame(gameState);
      console.log('[useGameStateLoader] New game state received:', newGameState);
      dispatch({ type: GameActionType.SetGameState, payload: newGameState });
    } catch (error) {
      console.error('[useGameStateLoader] Failed to start new game:', error);
      setError('Failed to start a new game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleNewGame };
};