'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, Message, KPIState } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { Logger } from '@/lib/utils/logger';
import { GameActionType } from './gameActionTypes';

export enum GameActionType {
  UpdateKPI = 'UPDATE_KPI',
  AddMessage = 'ADD_MESSAGE',
  SetCurrentCycle = 'SET_CURRENT_CYCLE',
  SetCurrentSituation = 'SET_CURRENT_SITUATION',
  ResetGame = 'RESET_GAME',
  SetGameState = 'SET_GAME_STATE',
}

type Action =
  | { type: GameActionType.UpdateKPI; payload: KPIState }
  | { type: GameActionType.AddMessage; payload: Message }
  | { type: GameActionType.SetCurrentCycle; payload: number }
  | { type: GameActionType.SetCurrentSituation; payload: string }
  | { type: GameActionType.ResetGame }
  | { type: GameActionType.SetGameState; payload: GameState };

const initialState: GameState = {
  currentCycle: 1,
  currentSituation: '',
  kpiHistory: [],
  messages: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  Logger.info('Dispatching action:', action);
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