import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Initialize counts
    let pendingCategories = 0
    let pendingCities = 0
    let pendingPhotographerGalleries = 0
    let pendingPhotographerStories = 0
    let pendingPhotographerApprovals = 0
    let pendingMessages = 0
    
    try {
      // Get pending counts directly from database
      const [
        pendingRequests,
        pendingGalleries,
        pendingStories,
        pendingPhotographers,
        unreadMessages
      ] = await Promise.all([
        db.collection('requests').find({ status: 'pending' }).toArray().catch(() => []),
        db.collection('photographer_galleries').find({ 
          status: 'pending',
          photographerId: { $exists: true, $ne: 'admin' }
        }).toArray().catch(() => []),
        db.collection('photographer_stories').find({ 
          status: 'pending',
          photographerId: { $exists: true, $ne: 'admin' }
        }).toArray().catch(() => []),
        db.collection('studios').find({ 
          status: 'pending'
        }).toArray().catch(() => []),
        db.collection('conversations').find({ 
          unreadCount: { $gt: 0 }
        }).toArray().catch(() => [])
      ])
      
      // Count by type
      pendingCategories = pendingRequests.filter((req: any) => req.type === 'category').length
      pendingCities = pendingRequests.filter((req: any) => req.type === 'city').length
      pendingPhotographerGalleries = pendingGalleries.length
      pendingPhotographerStories = pendingStories.length
      pendingPhotographerApprovals = pendingPhotographers.length
      pendingMessages = unreadMessages.reduce((total: number, conv: any) => total + (conv.unreadCount || 0), 0)
    } catch (collectionError) {
      console.error('Error querying collections:', collectionError)
      // Continue with default counts of 0
    }
    
    const total = pendingCategories + pendingCities + pendingPhotographerGalleries + pendingPhotographerStories + pendingPhotographerApprovals + pendingMessages
    
    return NextResponse.json({
      success: true,
      data: {
        categories: pendingCategories,
        cities: pendingCities,
        photographerGalleries: pendingPhotographerGalleries,
        photographerStories: pendingPhotographerStories,
        photographerApprovals: pendingPhotographerApprovals,
        messages: pendingMessages,
        total: total
      }
    })
  } catch (error) {
    console.error('Error fetching pending counts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pending counts',
      data: {
        categories: 0,
        cities: 0,
        photographerGalleries: 0,
        photographerStories: 0,
        photographerApprovals: 0,
        messages: 0,
        total: 0
      }
    }, { status: 500 })
  }
}