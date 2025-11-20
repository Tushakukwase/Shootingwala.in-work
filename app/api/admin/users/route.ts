import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || 'all';
    const status = searchParams.get('status') || 'all';
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType !== 'all') {
      query.role = userType;
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const allUsers = await users.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get total count for pagination
    const totalCount = await users.countDocuments(query);
    
    // Remove sensitive information like passwords
    const sanitizedUsers = allUsers.map(user => ({
      _id: user._id.toString(),
      fullName: user.fullName || user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'client',
      isVerified: user.isVerified || false,
      status: user.status || (user.isVerified ? 'active' : 'pending'),
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      image: user.image,
      // Don't include password or other sensitive data
    }));
    
    return NextResponse.json({ 
      success: true,
      users: sanitizedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalUsers: totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, action, userData } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    if (action === 'block') {
      // Block/unblock user
      const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'blocked' } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'User blocked successfully' 
      });
    } else if (action === 'unblock') {
      // Unblock user
      const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'active' } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'User unblocked successfully' 
      });
    } else if (action === 'update') {
      // Update user data
      const updateData: any = {};
      
      if (userData.fullName) updateData.fullName = userData.fullName;
      if (userData.email) updateData.email = userData.email;
      if (userData.phone) updateData.phone = userData.phone;
      
      const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const users = db.collection('users');
    
    const result = await users.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
}