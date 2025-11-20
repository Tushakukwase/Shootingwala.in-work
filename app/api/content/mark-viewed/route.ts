import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function POST(req: NextRequest) {
  try {
    // Mark all pending content notifications as viewed
    const galleries = MockStorage.getGalleries()
    const stories = MockStorage.getStories()
    
    // Reset notification flags for pending content
    galleries.forEach((gallery: any) => {
      if (gallery.status === 'pending') {
        gallery.is_notified = false
      }
    })
    
    stories.forEach((story: any) => {
      if (story.status === 'pending') {
        story.is_notified = false
      }
    })
    
    MockStorage.saveGalleries(galleries)
    MockStorage.saveStories(stories)
    
    return NextResponse.json({ 
      success: true,
      message: 'Content notifications marked as viewed'
    });
    
  } catch (error) {
    console.error('Error marking content as viewed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to mark content as viewed' 
    }, { status: 500 });
  }
}