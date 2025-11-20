import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check studio record
    const studio = await db.collection('studios').findOne({ email: email.toLowerCase() })
    
    // Check photographer record
    const photographer = await db.collection('photographers').findOne({ email: email.toLowerCase() })
    
    return NextResponse.json({
      success: true,
      email: email,
      studioExists: !!studio,
      photographerExists: !!photographer,
      studioData: studio ? {
        _id: studio._id.toString(),
        name: studio.name,
        email: studio.email,
        username: studio.username,
        photographerName: studio.photographerName
      } : null,
      photographerData: photographer ? {
        _id: photographer._id.toString(),
        name: photographer.name,
        email: photographer.email,
        phone: photographer.phone,
        studioId: photographer.studioId
      } : null
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    )
  }
}