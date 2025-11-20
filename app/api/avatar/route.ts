import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    // In a real app, you would handle file uploads properly
    // For now, we'll simulate storing the avatar URL in the database
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Simulate generating a URL for the avatar
    // In a real app, you would upload the file to storage and get a real URL
    const avatarUrl = `/avatars/${userId}_${Date.now()}.jpg`;
    
    // Update the user document with the avatar URL
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { avatarUrl, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Avatar updated successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update avatar' 
    }, { status: 500 });
  }
}