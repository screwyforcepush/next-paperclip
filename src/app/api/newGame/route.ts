import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Implement new game logic
  const initialGameState = {
    cycle: 1,
    company: {
      name: "Universal Paperclips Inc.",
      funds: 100000,
    },
    kpis: {
      revenue: 0,
      profitMargin: 0,
      cacClvRatio: 0,
      productionEfficiencyIndex: 0,
      marketShare: 0,
      innovationIndex: 0,
    },
  };

  return NextResponse.json(initialGameState);
}
