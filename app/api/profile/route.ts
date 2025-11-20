import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest) {
  try {
    // Handle file uploads
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      // Handle file upload
      // In a real app, you would process the file upload here
      // For now, we'll just return a success response
      return NextResponse.json({ 
        success: true, 
        message: 'Avatar updated successfully'
      });
    }
    
    const { userId, profileData } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Update basic profile information
    if (profileData.name) updateData.fullName = profileData.name;
    if (profileData.email) updateData.email = profileData.email;
    if (profileData.phone) updateData.phone = profileData.phone;
    if (profileData.gender) updateData.gender = profileData.gender;
    if (profileData.avatarUrl) updateData.avatarUrl = profileData.avatarUrl;

    // Update address information
    if (profileData.address) {
      updateData.address = {
        line1: profileData.address.line1 || '',
        line2: profileData.address.line2 || '',
        city: profileData.address.city || '',
        state: profileData.address.state || '',
        pincode: profileData.address.pincode || '',
        country: profileData.address.country || ''
      };
    }
    
    // Update preferences
    if (profileData.preferences) {
      updateData.preferences = {
        emailNotifications: profileData.preferences.emailNotifications,
        smsNotifications: profileData.preferences.smsNotifications,
        pushNotifications: profileData.preferences.pushNotifications
      };
    }
    
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Fetch updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch updated user data' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        address: updatedUser.address,
        preferences: updatedUser.preferences,
        avatarUrl: updatedUser.avatarUrl,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        preferences: user.preferences,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    }, { status: 500 });
  }
}