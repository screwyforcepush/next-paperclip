import { NextResponse } from 'next/server';
import { generateScenario } from '@/lib/simulation/scenarioGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { updatedOverview, llmMetadata, cycle, scenario } = await req.json();


  const response = await generateScenario(updatedOverview, llmMetadata, cycle, scenario);

  return NextResponse.json(response);
}
