import { useEffect, useState } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { startNewGame } from '@/lib/utils/api';
import { GameActionType } from '@/contexts/gameActionTypes';
import { Logger } from '@/lib/utils/logger';

export const useGameStateLoader = () => {
  const { gameState, dispatch } = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Logger.debug('[useGameStateLoader] Component mounted, current gameState:', gameState);
    if (gameState.messages.length === 0) {
      const savedState = loadGameState();
      if (savedState) {
        Logger.debug('[useGameStateLoader] Loaded game state from local storage:', savedState);
        dispatch({ type: GameActionType.SetGameState, payload: savedState });
      } else {
        Logger.debug('[useGameStateLoader] No valid saved state found, starting new game');
        handleNewGame();
      }
    }
    setLoading(false);
  }, []);

  const handleNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      Logger.debug('[useGameStateLoader] Starting new game');
      const newGameState = await startNewGame(gameState);
      Logger.debug('[useGameStateLoader] New game state received:', newGameState);
      dispatch({ type: GameActionType.SetGameState, payload: newGameState });
    } catch (error) {
      Logger.error('[useGameStateLoader] Failed to start new game:', error);
      setError('Failed to start a new game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleNewGame };
};