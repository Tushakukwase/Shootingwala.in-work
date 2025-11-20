import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('digital_albums')
    
    const albumData = await collection.findOne({ type: 'main' })
    
    if (!albumData) {
      return NextResponse.json({
        imageUrl: null,
        title: '',
        description: ''
      })
    }
    
    return NextResponse.json({
      imageUrl: albumData.imageUrl || null,
      title: albumData.title || '',
      description: albumData.description || ''
    })
  } catch (error) {
    console.error('Failed to fetch album data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch album data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('digital_albums')
    
    const body = await request.json()
    
    const albumData = {
      type: 'main',
      imageUrl: body.imageUrl || null,
      title: body.title || '',
      description: body.description || '',
      updatedAt: new Date()
    }
    
    // Upsert the album data (update if exists, insert if not)
    await collection.replaceOne(
      { type: 'main' },
      albumData,
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Album data saved successfully',
      data: {
        imageUrl: albumData.imageUrl,
        title: albumData.title,
        description: albumData.description
      }
    })
  } catch (error) {
    console.error('Failed to save album data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save album data' },
      { status: 500 }
    )
  }
}