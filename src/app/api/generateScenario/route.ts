import { NextResponse } from 'next/server';
import { generateScenario } from '@/lib/simulation/scenarioGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { gameState } = await req.json();


  const response = await generateScenario(gameState);

  return NextResponse.json(response);
}
