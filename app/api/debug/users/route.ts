import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Get all users
    const users = await db.collection('users').find({}).toArray()
    
    // Get all studios for comparison
    const studios = await db.collection('studios').find({}).toArray()
    
    return NextResponse.json({
      success: true,
      usersCount: users.length,
      studiosCount: studios.length,
      users: users.map(user => ({
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      })),
      studios: studios.map(studio => ({
        _id: studio._id.toString(),
        name: studio.name,
        email: studio.email,
        username: studio.username,
        photographerName: studio.photographerName
      }))
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch debug info'
    }, { status: 500 })
  }
}