import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function POST(req: NextRequest) {
  try {
    // Mark all pending gallery notifications as viewed
    const galleries = MockStorage.getGalleries()
    
    // Reset notification flags for pending galleries
    galleries.forEach((gallery: any) => {
      if (gallery.status === 'pending') {
        gallery.is_notified = false
      }
    })
    
    MockStorage.saveGalleries(galleries)
    
    return NextResponse.json({ 
      success: true,
      message: 'Gallery notifications marked as viewed'
    });
    
  } catch (error) {
    console.error('Error marking galleries as viewed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to mark galleries as viewed' 
    }, { status: 500 });
  }
}