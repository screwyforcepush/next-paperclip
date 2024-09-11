"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, Message, KPIState } from '@/types/game';
import { loadGameState, saveGameState } from '../lib/utils/localStorage';

type Action =
  | { type: 'UPDATE_KPI'; payload: KPIState }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CURRENT_CYCLE'; payload: number }
  | { type: 'SET_CURRENT_SITUATION'; payload: string }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  currentCycle: 1,
  currentSituation: '',
  kpiHistory: [],
  messages: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
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
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: 'RESET_GAME' });
      Object.entries(savedState).forEach(([key, value]) => {
        dispatch({ type: key as any, payload: value });
      });
    }
  }, []);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};