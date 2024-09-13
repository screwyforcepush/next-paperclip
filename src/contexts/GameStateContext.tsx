'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Message, KPIState } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';

type Action =
  | { type: 'UPDATE_KPI'; payload: KPIState }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CURRENT_CYCLE'; payload: number }
  | { type: 'SET_CURRENT_SITUATION'; payload: string }
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_STATE'; payload: GameState };

const initialState: GameState = {
  currentCycle: 1,
  currentSituation: '',
  kpiHistory: [],
  messages: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  console.log('[GameStateContext] Dispatching action:', action);
  switch (action.type) {
    case 'UPDATE_KPI':
      return {
        ...state,
        kpiHistory: [...state.kpiHistory, action.payload],
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_CURRENT_CYCLE':
      return {
        ...state,
        currentCycle: action.payload,
      };
    case 'SET_CURRENT_SITUATION':
      return {
        ...state,
        currentSituation: action.payload,
      };
    case 'RESET_GAME':
      return initialState;
    case 'SET_GAME_STATE':
      return typeof action.payload === 'string' ? JSON.parse(action.payload) : action.payload;
    default:
      return state;
  }
};

interface GameStateContextType {
  gameState: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      console.log('[GameStateContext] Loading saved state:', savedState);
      dispatch({ type: 'SET_GAME_STATE', payload: savedState });
    } else {
      console.log('[GameStateContext] No saved state found, using initial state');
    }
  }, []);

  useEffect(() => {
    if (gameState !== initialState) {
      console.log('[GameStateContext] Saving game state:', gameState);
      saveGameState(gameState);
    }
  }, [gameState]);

  console.log('[GameStateContext] Current game state:', gameState);

  return (
    <GameStateContext.Provider value={{ gameState, dispatch }}>
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