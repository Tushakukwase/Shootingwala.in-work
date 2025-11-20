import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { storyId, photographerId, photographerName } = await req.json();
    
    if (!storyId || !photographerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story ID and photographer ID are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('photographer_stories');
    const notifications = db.collection('notifications');
    
    // Find the story
    const story = await stories.findOne({ _id: new ObjectId(storyId) });
    
    if (!story) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story not found' 
      }, { status: 404 });
    }
    
    // Update story status to pending
    await stories.updateOne(
      { _id: new ObjectId(storyId) },
      { 
        $set: { 
          status: 'pending',
          request_date: new Date(),
          is_notified: true,
          updatedAt: new Date()
        } 
      }
    );
    
    // Create notification for admin
    const newNotification = {
      type: 'story_homepage_request',
      title: 'Story Homepage Request',
      message: `${photographerName} requested to display story "${story.title}" on homepage`,
      userId: 'admin',
      relatedId: storyId,
      actionRequired: true,
      read: false,
      createdAt: new Date(),
      photographerId,
      photographerName,
      contentType: 'story',
      contentTitle: story.title
    };
    
    await notifications.insertOne(newNotification);
    
    return NextResponse.json({ 
      success: true,
      message: 'Homepage request sent successfully'
    });
    
  } catch (error) {
    console.error('Error creating homepage request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send homepage request' 
    }, { status: 500 });
  }
}