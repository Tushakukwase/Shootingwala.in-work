import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories'); // Use the same stories collection
    
    // Query for stories created by photographers
    let query: any = { created_by: 'photographer' }
    
    // Filter by photographer if specified
    if (photographerId) {
      query.photographerId = photographerId
    }
    
    const allStories = await stories.find(query).sort({ createdAt: -1 }).toArray();
    
    // Transform to match component interface
    const transformedStories = allStories.map((story: any) => ({
      id: story._id.toString(),
      title: story.title,
      content: story.content,
      coverImage: story.imageUrl || story.coverImage || '',
      location: story.location || '',
      date: story.date || '',
      photographerId: story.photographerId || 'unknown',
      photographerName: story.photographerName || story.photographer || 'Photographer',
      status: story.status || 'draft',
      showOnHome: story.showOnHome || false,
      createdAt: story.createdAt,
      approvedAt: story.approved_at
    }))
    
    return NextResponse.json({ 
      success: true,
      stories: transformedStories
    });
  } catch (error) {
    console.error('Error fetching photographer stories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stories' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, coverImage, location, date, photographerId, photographerName } = await req.json();
    
    if (!title || !content || !photographerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, content, and photographer ID are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories'); // Use the same stories collection
    
    const isAdmin = photographerId === 'admin'
    
    const newStory = {
      title,
      content,
      imageUrl: coverImage || '', // Use imageUrl field for consistency
      date: date || new Date().toISOString().split('T')[0],
      location: location || '',
      photographerId: isAdmin ? null : photographerId,
      photographerName: isAdmin ? null : photographerName,
      photographer: isAdmin ? null : photographerName, // Keep both for backward compatibility
      category: 'Wedding',
      tags: ['Wedding'],
      content_type: 'story',
      created_by: isAdmin ? 'admin' : 'photographer', // Distinguish creator type
      created_by_name: isAdmin ? 'Admin' : photographerName,
      approved_by: isAdmin ? 'admin' : null,
      approved_by_name: isAdmin ? 'Admin' : null,
      status: isAdmin ? 'approved' : 'draft', // Photographer stories start as draft
      showOnHome: false, // Never show on homepage without explicit approval
      request_date: null,
      approved_at: isAdmin ? new Date() : null,
      is_notified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await stories.insertOne(newStory);
    
    return NextResponse.json({ 
      success: true,
      story: {
        id: result.insertedId.toString(),
        title: newStory.title,
        content: newStory.content,
        coverImage: newStory.imageUrl,
        location: newStory.location,
        date: newStory.date,
        photographerId: newStory.photographerId,
        status: newStory.status,
        showOnHome: newStory.showOnHome,
        createdAt: newStory.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating photographer story:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create story' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, coverImage, location, date, status, showOnHome, approved_by, approved_by_name } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Story ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories'); // Use the same stories collection
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Update fields
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (coverImage) updateData.imageUrl = coverImage; // Use imageUrl for consistency
    if (location) updateData.location = location;
    if (date) updateData.date = date;
    
    if (status) {
      updateData.status = status;
      // Only set showOnHome to false when rejecting, don't auto-set to true when approving
      if (status === 'rejected') {
        updateData.showOnHome = false;
      }
      if (status === 'approved') {
        updateData.approved_at = new Date();
      }
    }
    
    // Only allow showOnHome to be true if status is approved
    if (showOnHome !== undefined) {
      const story = await stories.findOne({ _id: new ObjectId(id) });
      if (story && (story.status === 'approved' || status === 'approved')) {
        updateData.showOnHome = showOnHome;
      } else if (!showOnHome) {
        // Always allow setting to false
        updateData.showOnHome = false;
      }
    }
    
    if (approved_by) {
      updateData.approved_by = approved_by;
      updateData.approved_by_name = approved_by_name;
    }
    
    const result = await stories.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
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
      story: {
        id: updatedStory._id.toString(),
        title: updatedStory.title,
        content: updatedStory.content,
        coverImage: updatedStory.imageUrl || updatedStory.coverImage || '',
        location: updatedStory.location || '',
        date: updatedStory.date || '',
        photographerId: updatedStory.photographerId || '',
        status: updatedStory.status || 'draft',
        showOnHome: updatedStory.showOnHome || false,
        createdAt: updatedStory.createdAt,
        approvedAt: updatedStory.approved_at
      }
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
    const stories = db.collection('stories'); // Use the same stories collection
    
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