import { useState, useEffect } from 'react';
import { useGameState } from '@/contexts/GameStateContext';
import { GameActionType } from '@/contexts/gameActionTypes';
import { Message } from '@/types/game';
import { Logger } from '@/lib/utils/logger';

export const useMessageHandler = (input: string, setInput: (input: string) => void) => {
  const { gameState, dispatch } = useGameState();
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const lastMessage = gameState.messages[gameState.messages.length - 1];
    if (lastMessage && lastMessage.role === 'business_cycle') {
      Logger.debug('[useMessageHandler] Simulation ended');
      setIsSimulating(false);
    }
  }, [gameState.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput || !gameState) return;

    Logger.debug('[useMessageHandler] Submitting user input:', userInput);
    const userMessage: Message = { role: 'user', content: userInput };
    dispatch({ type: GameActionType.AddMessage, payload: userMessage });
    setInput('');
    
    const messageRecieved: Message = {
        role: 'system',
        name: 'CEO',
        content: "Thank you for your advice. We will discuss internally and take action.",
      };
    dispatch({ type: GameActionType.AddMessage, payload: messageRecieved });


    setIsSimulating(true);
    Logger.debug('[useMessageHandler] isSimulating set to true');

    try {
      Logger.info('[useMessageHandler] Simulating business cycle');

      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, gameState }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const messages = chunk.split('\n').filter(Boolean);

        for (const message of messages) {
          try {
            const parsedMessage = JSON.parse(message);

            if ('cycleNumber' in parsedMessage && parsedMessage.cycleNumber) {
              parsedMessage.cycleNumber = parsedMessage.cycleNumber;
            }

            if (parsedMessage.type === 'kpis') {
              Logger.debug('[useMessageHandler] Received KPI update:', parsedMessage.content);
              dispatch({ type: GameActionType.UpdateKPI, payload: parsedMessage.content });
            } else if (parsedMessage.type === 'business_overview') {
              Logger.debug('[useMessageHandler] Matched business_overview condition');
              Logger.debug('[useMessageHandler] Received overview update:', parsedMessage.content);
              dispatch({ type: GameActionType.SetBusinessOverview, payload: parsedMessage.content });
            } else if (parsedMessage.role === 'business_cycle') {
              const newCycle = parseInt(parsedMessage.content, 10);
              if (!isNaN(newCycle)) {
                Logger.debug('[useMessageHandler] Updating current cycle to:', newCycle);
                dispatch({ type: GameActionType.SetCurrentCycle, payload: newCycle });
                const businessCycleMessage: Message = { role: 'business_cycle', content: newCycle.toString() };
                dispatch({ type: GameActionType.AddMessage, payload: businessCycleMessage });
                Logger.debug('[useMessageHandler] currentCycle set to:', newCycle);
              } else {
                Logger.error('[useMessageHandler] Invalid business cycle number:', parsedMessage.content);
              }
              setIsSimulating(false);
              Logger.debug('[useMessageHandler] isSimulating set to false');
            } else {
              if (parsedMessage.role === 'scenario') {
                dispatch({ type: GameActionType.SetCurrentSituation, payload: parsedMessage.content });
              }
              Logger.debug('[useMessageHandler] Full unhandled message:', JSON.stringify(parsedMessage));
              dispatch({ type: GameActionType.AddMessage, payload: parsedMessage });
            }
          } catch (error) {
            Logger.error('[useMessageHandler] Error parsing message:', error, 'Raw message:', message);
          }
        }
      }

      Logger.info('[useMessageHandler] Business cycle simulation complete');
    } catch (error) {
      Logger.error('[useMessageHandler] Error simulating business cycle:', error);
      setIsSimulating(false);
      Logger.debug('[useMessageHandler] isSimulating set to false');
    }
  };

  return { handleSubmit, isSimulating }; 
};