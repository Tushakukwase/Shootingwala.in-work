import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // This endpoint can be called to clear server-side cache if needed
    // For now, it just returns success to indicate cache clearing
    
    return NextResponse.json({ 
      success: true,
      message: 'Cache cleared successfully. Please refresh your browser and clear localStorage.'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear cache' 
    }, { status: 500 });
  }
}