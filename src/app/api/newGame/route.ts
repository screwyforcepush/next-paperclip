import { NextResponse } from 'next/server';
import { GameState, KPIState, Message } from '@/types/game';
import { generateScenario } from '@/lib/simulation/scenarioGenerator';

export async function POST() {
  try {
    const initialKPI: KPIState = {
      revenue: 1000000,
      profitMargin: 0.1,
      cacClvRatio: 0.5,
      productionEfficiencyIndex: 0.7,
      marketShare: 0.05,
      innovationIndex: 0.6,
    };

    const initialScenario = await generateScenario(initialKPI, 1);

    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'System',
        content: 'Welcome to Universal Paperclips! Let\'s start your journey as a business consultant.',
        type: 'system',
      },
      {
        id: '2',
        sender: 'System',
        content: initialScenario,
        type: 'system',
      },
    ];

    const newGameState: GameState = {
      currentCycle: 1,
      currentSituation: initialScenario,
      kpiHistory: [initialKPI],
      messages: initialMessages,
    };

    return NextResponse.json(newGameState);
  } catch (error) {
    console.error('[newGame] Error creating new game:', error);
    return NextResponse.json({ error: 'Failed to create new game' }, { status: 500 });
  }
}
