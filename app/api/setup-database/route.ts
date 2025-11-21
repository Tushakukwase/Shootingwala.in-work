// app/api/setup-database/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // List of collections to create
    const collections = [
      'categories',
      'cities',
      'studios', 
      'photographer_profiles',
      'reviews',
      'galleries',
      'stories',
      'requests',
      'homepage_items',
      'hero_sections',
      'digital_invitations',
      'digital_albums'
    ]
    
    const results: string[] = [] // Explicitly type the array
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName)
        // This creates the collection if it doesn't exist
        const count = await collection.countDocuments()
        results.push(`${collectionName}: exists (${count} documents)`)
      } catch (error: unknown) { // Use unknown instead of any
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push(`${collectionName}: error - ${errorMessage}`)
      }
    }
    
    return NextResponse.json({
      status: 'success',
      collections: results
    })
  } catch (error: unknown) { // Use unknown instead of any
    console.error('Database setup failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Database setup failed', details: errorMessage },
      { status: 500 }
    )
  }
}