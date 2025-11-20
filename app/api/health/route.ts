import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Simple health check
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    
    return NextResponse.json(healthData);
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Health check failed' }, { status: 500 });
  }
}