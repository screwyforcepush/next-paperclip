import { NextResponse } from 'next/server';
import { getServerSideEnv } from '@/lib/env';

export async function GET() {
  const env = getServerSideEnv();
  return NextResponse.json({
    OPENAI_API_KEY_SET: !!env.OPENAI_API_KEY,
    API_BASE_URL_SET: !!env.API_BASE_URL,
  });
}