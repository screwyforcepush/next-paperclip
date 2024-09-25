'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Message, KPIState } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { Logger } from '@/lib/utils/logger';
import { GameActionType } from './gameActionTypes';

type Action =
  | { type: GameActionType.UpdateKPI; payload: KPIState }
  | { type: GameActionType.AddMessage; payload: Message }
  | { type: GameActionType.SetCurrentCycle; payload: number }
  | { type: GameActionType.SetCurrentSituation; payload: string }
  | { type: GameActionType.ResetGame }
  | { type: GameActionType.SetGameState; payload: GameState }
  | { type: 'SET_GAME_STATE'; payload: GameState };

const initialState: GameState = {
  currentCycle: 1,
  currentSituation: '',
  kpiHistory: [],
  messages: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  Logger.info('Dispatching action:', action);
  switch (action.type) {
    case GameActionType.UpdateKPI:
      return {
        ...state,
        kpiHistory: [...state.kpiHistory, action.payload],
      };
    case GameActionType.AddMessage:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case GameActionType.SetCurrentCycle:
      return {
        ...state,
        currentCycle: action.payload,
      };
    case GameActionType.SetCurrentSituation:
      return {
        ...state,
        currentSituation: action.payload,
      };
    case GameActionType.ResetGame:
      return initialState;
    case GameActionType.SetGameState:
      return typeof action.payload === 'string' ? JSON.parse(action.payload) : action.payload;
    case 'SET_GAME_STATE':
      return action.payload;
    default:
      return state;
  }
};

interface GameStateContextType {
  gameState: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

const initializer = (): GameState => {
  try {
    const savedState = loadGameState();
    if (savedState) {
      console.log('[GameStateContext] Initializing with saved state:', savedState);
      return savedState;
    } else {
      console.log('[GameStateContext] No saved state found, using initial state');
      return initialState;
    }
  } catch (error) {
    console.error('Error during state initialization:', error);
    return initialState;
  }
};

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState, initializer);

  useEffect(() => {
    try {
      if (gameState !== initialState) {
        console.log('[GameStateContext] Saving game state:', gameState);
        saveGameState(gameState);
      }
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [gameState]);

  Logger.info('Current game state:', gameState);

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

export { GameStateContext };