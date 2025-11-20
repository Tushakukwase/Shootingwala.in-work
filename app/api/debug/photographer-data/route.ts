import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('id')
    
    if (!photographerId) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check all collections for this photographer
    const photographers = await db.collection('photographers').findOne({ _id: photographerId })
    const studios = await db.collection('studios').findOne({ _id: photographerId })
    const galleries = await db.collection('photographer_galleries').find({ photographerId }).toArray()
    const stories = await db.collection('photographer_stories').find({ photographerId }).toArray()
    const packages = await db.collection('photographer_packages').find({ photographerId }).toArray()
    const profiles = await db.collection('photographer_profiles').findOne({ photographerId })
    
    return NextResponse.json({
      success: true,
      data: {
        photographerId,
        photographer: photographers,
        studio: studios,
        galleries: galleries.length,
        stories: stories.length,
        packages: packages.length,
        profile: profiles ? 'exists' : 'not found',
        galleryData: galleries.map(g => ({ name: g.name, images: g.images?.length || 0, status: g.status })),
        storyData: stories.map(s => ({ title: s.title, hasImage: !!s.coverImage, status: s.status })),
        packageData: packages.map(p => ({ name: p.name, price: p.price, active: p.isActive }))
      }
    })
    
  } catch (error) {
    console.error('Error fetching debug data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debug data' },
      { status: 500 }
    )
  }
}