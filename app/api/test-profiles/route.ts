import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check photographer_profiles collection
    const profiles = await db.collection('photographer_profiles').find({}).limit(5).toArray()
    
    // Check photographers collection
    const photographers = await db.collection('photographers').find({}).limit(5).toArray()
    
    return NextResponse.json({
      success: true,
      data: {
        profilesCount: profiles.length,
        photographersCount: photographers.length,
        sampleProfiles: profiles.map(p => ({
          photographerId: p.photographerId,
          name: p.name,
          studioName: p.studioName,
          studioBannerImage: !!p.studioBannerImage
        })),
        samplePhotographers: photographers.map(p => ({
          _id: p._id.toString(),
          name: p.name,
          email: p.email
        }))
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}