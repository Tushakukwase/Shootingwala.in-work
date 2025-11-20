import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check all collections for photographer data
    const photographers = await db.collection('photographers').find({}).limit(5).toArray()
    const studios = await db.collection('studios').find({}).limit(5).toArray()
    const profiles = await db.collection('photographer_profiles').find({}).limit(5).toArray()
    
    return NextResponse.json({
      success: true,
      data: {
        photographers: photographers.map(p => ({ _id: p._id, name: p.name, email: p.email })),
        studios: studios.map(s => ({ _id: s._id, name: s.name || s.fullName, email: s.email })),
        profiles: profiles.map(pr => ({ photographerId: pr.photographerId, name: pr.name, email: pr.email }))
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}