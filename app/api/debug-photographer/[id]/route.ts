import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photographerId = params.id
    console.log('Debug: Checking photographer ID:', photographerId)
    
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check all collections
    const photographers = db.collection('photographers')
    const studios = db.collection('studios')
    const profiles = db.collection('photographer_profiles')
    const galleries = db.collection('photographer_galleries')
    const packages = db.collection('photographer_packages')
    
    let result = {
      photographerId,
      isValidObjectId: ObjectId.isValid(photographerId),
      found: {
        photographers: null,
        studios: null,
        profiles: null,
        galleries: [],
        packages: []
      }
    }
    
    // Try photographers collection
    if (ObjectId.isValid(photographerId)) {
      result.found.photographers = await photographers.findOne({ _id: new ObjectId(photographerId) })
    }
    if (!result.found.photographers) {
      result.found.photographers = await photographers.findOne({ _id: photographerId })
    }
    
    // Try studios collection
    if (ObjectId.isValid(photographerId)) {
      result.found.studios = await studios.findOne({ _id: new ObjectId(photographerId) })
    }
    if (!result.found.studios) {
      result.found.studios = await studios.findOne({ _id: photographerId })
    }
    
    // Try profiles collection
    result.found.profiles = await profiles.findOne({ photographerId })
    
    // Try galleries
    result.found.galleries = await galleries.find({ photographerId }).toArray()
    
    // Try packages
    result.found.packages = await packages.find({ photographerId }).toArray()
    
    return NextResponse.json({
      success: true,
      debug: result
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}