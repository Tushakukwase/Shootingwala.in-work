import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI)
    console.log('MONGO_URI preview:', process.env.MONGO_URI?.substring(0, 50) + '...')
    
    const client = await clientPromise
    console.log('Client connected successfully')
    
    const db = client.db('photobook')
    console.log('Database selected: photobook')
    
    // Test with a simple ping instead of stats
    const result = await db.admin().ping()
    console.log('Ping result:', result)
    
    // Try to list collections
    const collections = await db.listCollections().toArray()
    console.log('Collections found:', collections.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      database: 'photobook',
      collections: collections.length,
      collectionNames: collections.map(c => c.name)
    })
  } catch (error) {
    console.error('Database connection error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}