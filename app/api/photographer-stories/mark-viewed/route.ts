import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function POST(req: NextRequest) {
  try {
    // Mark all pending story notifications as viewed
    const stories = MockStorage.getStories()
    
    // Reset notification flags for pending stories
    stories.forEach((story: any) => {
      if (story.status === 'pending') {
        story.is_notified = false
      }
    })
    
    MockStorage.saveStories(stories)
    
    return NextResponse.json({ 
      success: true,
      message: 'Story notifications marked as viewed'
    });
    
  } catch (error) {
    console.error('Error marking stories as viewed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to mark stories as viewed' 
    }, { status: 500 });
  }
}