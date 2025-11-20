import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const stories = db.collection('stories');
    
    const story = await stories.findOne({ _id: new ObjectId(id) });
    
    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      story: story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch story' }, { status: 500 });
  }
}