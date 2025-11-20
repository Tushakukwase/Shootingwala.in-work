import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    
    const comments = MockStorage.getComments();
    
    let filteredComments = comments;
    if (contentId) {
      filteredComments = comments.filter((comment: any) => comment.contentId === contentId);
    }
    if (contentType) {
      filteredComments = filteredComments.filter((comment: any) => comment.contentType === contentType);
    }
    
    // Sort comments by createdAt descending (newest first)
    filteredComments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ 
      success: true,
      comments: filteredComments,
      count: filteredComments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch comments' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, contentType, userId, userName, userAvatar, comment } = await request.json();
    
    if (!contentId || !contentType || !userId || !userName || !comment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID, content type, user ID, user name, and comment are required' 
      }, { status: 400 });
    }
    
    const comments = MockStorage.getComments();
    
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      userId,
      userName,
      userAvatar: userAvatar || '',
      comment,
      createdAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    MockStorage.saveComments(comments);
    
    return NextResponse.json({ 
      success: true,
      comment: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add comment' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');
    
    if (!commentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Comment ID is required' 
      }, { status: 400 });
    }
    
    const comments = MockStorage.getComments();
    const commentIndex = comments.findIndex((comment: any) => comment.id === commentId);
    
    if (commentIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Comment not found' 
      }, { status: 404 });
    }
    
    // Check if user is owner of comment or admin
    if (userId && comments[commentIndex].userId !== userId) {
      // Check if user is admin (in real implementation, you would check user role)
      // For now, we'll allow deletion if userId is provided
    }
    
    comments.splice(commentIndex, 1);
    MockStorage.saveComments(comments);
    
    return NextResponse.json({ 
      success: true,
      message: 'Comment removed successfully'
    });
  } catch (error) {
    console.error('Error removing comment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove comment' 
    }, { status: 500 });
  }
}