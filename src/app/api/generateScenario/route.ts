import { NextResponse } from 'next/server';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { currentCycle, kpiData } = await req.json();

  const llm = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  const template = `
    You are a business scenario generator for a paperclip company simulation game.
    Current business cycle: {currentCycle}
    Latest KPI data: {kpiData}

    Generate a brief, challenging business scenario or inflection point for the next cycle.
    The scenario should be related to the paperclip industry and consider the current KPIs.
    Keep the response under 50 words.
  `;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['currentCycle', 'kpiData'],
  });

  const formattedPrompt = await prompt.format({
    currentCycle,
    kpiData: JSON.stringify(kpiData[kpiData.length - 1]),
  });

  const response = await llm.call(formattedPrompt);

  return NextResponse.json({ scenario: response });
}
