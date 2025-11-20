import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    )
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}