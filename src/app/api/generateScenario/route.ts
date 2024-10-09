import { NextResponse } from 'next/server';
import { generateScenario } from '@/lib/simulation/scenarioGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { updatedOverview, llmMetadata } = await req.json();


  const response = await generateScenario(updatedOverview, llmMetadata);

  return NextResponse.json(response);
}
