import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Get all collections data
    const photographers = await db.collection('photographers').find({}).toArray()
    const profiles = await db.collection('photographer_profiles').find({}).toArray()
    const studios = await db.collection('studios').find({}).toArray()
    
    // Find the photographer with ID that was showing in the UI
    const targetPhotographer = photographers.find(p => 
      p.email === 'arjun.clicks@gmail.com' || 
      p.name === 'arjun.clicks@gmail.com'
    )
    
    let targetProfile = null
    let targetStudio = null
    
    if (targetPhotographer) {
      const targetId = targetPhotographer._id.toString()
      targetProfile = profiles.find(p => p.photographerId === targetId)
      targetStudio = studios.find(s => s._id.toString() === targetId)
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        totalPhotographers: photographers.length,
        totalProfiles: profiles.length,
        totalStudios: studios.length,
        
        samplePhotographers: photographers.slice(0, 3).map(p => ({
          _id: p._id.toString(),
          name: p.name,
          email: p.email,
          studioName: p.studioName,
          studioBannerImage: p.studioBannerImage
        })),
        
        sampleProfiles: profiles.slice(0, 3).map(p => ({
          photographerId: p.photographerId,
          name: p.name,
          studioName: p.studioName,
          studioBannerImage: p.studioBannerImage
        })),
        
        sampleStudios: studios.slice(0, 3).map(s => ({
          _id: s._id.toString(),
          name: s.name,
          fullName: s.fullName,
          bannerImage: s.bannerImage
        })),
        
        targetPhotographer: targetPhotographer ? {
          _id: targetPhotographer._id.toString(),
          name: targetPhotographer.name,
          email: targetPhotographer.email,
          studioName: targetPhotographer.studioName,
          studioBannerImage: targetPhotographer.studioBannerImage
        } : null,
        
        targetProfile: targetProfile,
        targetStudio: targetStudio
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    })
  }
}