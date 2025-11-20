import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    // Fetch all users
    const allUsers = await users.find({}).toArray();
    
    // Remove sensitive information like passwords
    const sanitizedUsers = allUsers.map(user => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role || 'client',
      isVerified: user.isVerified || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      // Don't include password or other sensitive data
    }));
    
    return NextResponse.json({ 
      success: true,
      users: sanitizedUsers,
      total: sanitizedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}