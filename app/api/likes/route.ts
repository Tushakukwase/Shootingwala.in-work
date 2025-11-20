import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    
    const likes = MockStorage.getLikes();
    
    let filteredLikes = likes;
    if (contentId) {
      filteredLikes = likes.filter((like: any) => like.contentId === contentId);
    }
    if (contentType) {
      filteredLikes = filteredLikes.filter((like: any) => like.contentType === contentType);
    }
    
    return NextResponse.json({ 
      success: true,
      likes: filteredLikes,
      count: filteredLikes.length
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch likes' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, contentType, userId } = await request.json();
    
    if (!contentId || !contentType || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID, content type, and user ID are required' 
      }, { status: 400 });
    }
    
    const likes = MockStorage.getLikes();
    
    // Check if user already liked this content
    const existingLike = likes.find((like: any) => 
      like.contentId === contentId && 
      like.userId === userId
    );
    
    if (existingLike) {
      return NextResponse.json({ 
        success: false, 
        error: 'User already liked this content' 
      }, { status: 400 });
    }
    
    const newLike = {
      id: `${contentId}-${userId}-${Date.now()}`,
      contentId,
      contentType,
      userId,
      createdAt: new Date().toISOString()
    };
    
    likes.push(newLike);
    MockStorage.saveLikes(likes);
    
    return NextResponse.json({ 
      success: true,
      like: newLike,
      message: 'Content liked successfully'
    });
  } catch (error) {
    console.error('Error liking content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to like content' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const userId = searchParams.get('userId');
    
    if (!contentId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID and user ID are required' 
      }, { status: 400 });
    }
    
    const likes = MockStorage.getLikes();
    const likeIndex = likes.findIndex((like: any) => 
      like.contentId === contentId && 
      like.userId === userId
    );
    
    if (likeIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Like not found' 
      }, { status: 404 });
    }
    
    likes.splice(likeIndex, 1);
    MockStorage.saveLikes(likes);
    
    return NextResponse.json({ 
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove like' 
    }, { status: 500 });
  }
}