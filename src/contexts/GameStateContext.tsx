'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Message, KPI } from '@/types/game';
import { loadGameState, saveGameState } from '@/lib/utils/localStorage';
import { Logger } from '@/lib/utils/logger';
import { GameActionType } from './gameActionTypes';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: GameActionType.UpdateKPI; payload: KPI }
  | { type: GameActionType.AddMessage; payload: Message }
  | { type: GameActionType.SetCurrentCycle; payload: number }
  | { type: GameActionType.SetCurrentSituation; payload: string }
  | { type: GameActionType.SetBusinessOverview; payload: string }
  | { type: GameActionType.ResetGame }
  | { type: GameActionType.SetGameState; payload: GameState }
  | { type: 'SET_GAME_STATE'; payload: GameState };

const initialState: GameState = {
  userId: '',
  gameId: '',
  sessionId: '', // Add this line
  currentCycle: 1,
  currentSituation: '',
  businessOverview: '',
  kpiHistory: [],
  messages: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  Logger.debug('Dispatching action:', action);
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
    case GameActionType.SetBusinessOverview:
      return {
        ...state,
        businessOverview: action.payload,
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
      Logger.info('[GameStateContext] Initializing with saved state:', savedState);
      return savedState; // This will already have a new sessionId from loadGameState
    } else {
      Logger.info('[GameStateContext] No saved state found, creating new state with UUIDs');
      return {
        ...initialState,
        userId: uuidv4(),
        gameId: uuidv4(),
        sessionId: uuidv4(), // Generate a new sessionId only for the very first time
      };
    }
  } catch (error) {
    Logger.error('Error during state initialization:', error);
    return {
      ...initialState,
      userId: uuidv4(),
      gameId: uuidv4(),
      sessionId: uuidv4(), // Generate a new sessionId only in case of an error
    };
  }
};

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState, initializer);

  useEffect(() => {
    try {
      if (gameState !== initialState) {
        Logger.info('[GameStateContext] Saving game state:', gameState);
        saveGameState(gameState);
      }
    } catch (error) {
      Logger.error('Error saving game state:', error);
    }
  }, [gameState]);

  Logger.debug('Current game state:', gameState);

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