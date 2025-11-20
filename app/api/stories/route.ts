import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories');
    
    // Fetch all stories (both admin and photographer)
    const allStories = await stories.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ 
      success: true,
      stories: allStories
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stories' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, imageUrl, date, location, photographer, category, tags, status = 'approved', published = true, created_by = 'admin', photographerId, photographerName, showOnHome = true } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and content are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories');
    
    const newStory = {
      title,
      content,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
      date: date || new Date().toISOString().split('T')[0],
      location: location || "Beautiful Venue",
      photographer: photographer || "Professional Photographer",
      category: category || 'Wedding',
      tags: tags || ["Wedding"],
      status,
      showOnHome, // Use the provided value or default to true
      published,
      created_by, // 'admin' or 'photographer'
      photographerId: photographerId || null, // For photographer stories
      photographerName: photographerName || null, // For photographer stories
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await stories.insertOne(newStory);
    
    return NextResponse.json({ 
      success: true,
      story: { ...newStory, _id: result.insertedId }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create story' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories');
    
    const result = await stories.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story not found' 
      }, { status: 404 });
    }
    
    const updatedStory = await stories.findOne({ _id: new ObjectId(id) });
    
    // Add null check for updatedStory
    if (!updatedStory) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to retrieve updated story' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      story: updatedStory
    });
    
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update story' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories');
    
    const result = await stories.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Story deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete story' 
    }, { status: 500 });
  }
}