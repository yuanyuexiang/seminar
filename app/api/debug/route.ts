import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const debug = {
    env: {
      LIVEKIT_URL: process.env.LIVEKIT_URL,
      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ? 'SET' : 'MISSING',
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    },
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debug);
}