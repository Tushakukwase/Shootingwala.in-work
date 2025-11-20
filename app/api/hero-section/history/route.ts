import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('hero_sections')
    
    // Get all hero sections ordered by creation date (newest first)
    const heroHistory = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10) // Limit to last 10 entries
      .toArray()
    
    return NextResponse.json({
      success: true,
      data: heroHistory
    })
  } catch (error) {
    console.error('Failed to fetch hero section history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero section history' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Hero section ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('hero_sections')
    
    const result = await collection.deleteOne({ _id: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Hero section not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hero section deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete hero section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero section' },
      { status: 500 }
    )
  }
}