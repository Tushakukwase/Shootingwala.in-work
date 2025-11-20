import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('galleries');
    
    const allGalleries = await galleries.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ 
      success: true,
      galleries: allGalleries
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch galleries' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, category, description, images, status = 'approved' } = await req.json();
    
    if (!title || !category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and category are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('galleries');
    
    const newGallery = {
      title,
      category,
      description: description || '',
      images: images || [],
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await galleries.insertOne(newGallery);
    
    return NextResponse.json({ 
      success: true,
      gallery: { ...newGallery, _id: result.insertedId }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create gallery' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('galleries');
    
    const result = await galleries.updateOne(
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
        error: 'Gallery not found' 
      }, { status: 404 });
    }
    
    const updatedGallery = await galleries.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ 
      success: true,
      gallery: updatedGallery
    });
    
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update gallery' 
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
        error: 'Gallery ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('galleries');
    
    const result = await galleries.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Gallery deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete gallery' 
    }, { status: 500 });
  }
}