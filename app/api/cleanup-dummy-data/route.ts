import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Remove all cities that are not approved (don't have show_on_home = true or selected = true)
    const citiesCollection = db.collection('cities')
    const deletedCities = await citiesCollection.deleteMany({
      $and: [
        { show_on_home: { $ne: true } },
        { selected: { $ne: true } }
      ]
    })
    
    // Remove all requests that are not approved
    const requestsCollection = db.collection('requests')
    const deletedRequests = await requestsCollection.deleteMany({
      status: { $ne: 'approved' }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dummy data cleaned up successfully',
      deleted: {
        cities: deletedCities.deletedCount,
        requests: deletedRequests.deletedCount
      }
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to cleanup dummy data' }, { status: 500 })
  }
}