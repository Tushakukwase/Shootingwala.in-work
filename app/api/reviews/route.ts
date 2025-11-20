import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const approved = searchParams.get('approved')
    
    const client = await clientPromise
    const db = client.db('photobook')
    const reviews = db.collection('reviews')
    
    let query: any = {}
    
    if (photographerId) {
      query.photographerId = photographerId
    }
    
    if (approved !== null) {
      query.approved = approved === 'true'
    }
    
    const reviewsData = await reviews.find(query).toArray()
    
    // Transform ObjectId to string for frontend
    const transformedReviews = reviewsData.map(review => ({
      ...review,
      id: review._id.toString(),
      _id: undefined // Remove the _id field
    }))
    
    console.log('Fetched reviews:', transformedReviews.length, 'for photographer:', photographerId)
    
    return NextResponse.json({ success: true, data: transformedReviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      photographerId, 
      clientName, 
      clientEmail, 
      rating, 
      comment, 
      bookingId,
      eventType
    } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const reviews = db.collection('reviews')
    
    // Check if client has already submitted a review for this photographer
    const existingReview = await reviews.findOne({
      photographerId,
      clientEmail
    })
    
    if (existingReview) {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already submitted a review for this photographer. You can update your existing review instead.' 
      }, { status: 400 })
    }
    
    const newReview = {
      photographerId,
      clientName,
      clientEmail,
      rating,
      comment,
      bookingId,
      eventType,
      approved: true, // Automatically approve reviews for testing
      createdAt: new Date().toISOString(),
      response: null
    }
    
    const result = await reviews.insertOne(newReview)
    
    // Transform the inserted document for response
    const insertedReview = {
      ...newReview,
      id: result.insertedId.toString(),
      _id: result.insertedId
    }
    
    console.log('Created new review:', insertedReview)
    
    return NextResponse.json({ success: true, data: insertedReview })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, clientEmail, ...updates } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const reviews = db.collection('reviews')
    
    // If updating by ID, verify the review exists
    if (id) {
      const result = await reviews.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
      }
      
      // Fetch the updated review
      const updatedReview = await reviews.findOne({ _id: new ObjectId(id) })
      
      // Transform for response
      const transformedReview = {
        ...updatedReview,
        id: updatedReview?._id.toString(),
        _id: undefined
      }
      
      console.log('Updated review:', transformedReview)
      
      return NextResponse.json({ success: true, data: transformedReview })
    }
    
    // If updating by clientEmail and photographerId (for client updating their own review)
    if (clientEmail && updates.photographerId) {
      const result = await reviews.updateOne(
        { 
          photographerId: updates.photographerId,
          clientEmail: clientEmail
        },
        { $set: updates }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
      }
      
      // Fetch the updated review
      const updatedReview = await reviews.findOne({ 
        photographerId: updates.photographerId,
        clientEmail: clientEmail
      })
      
      // Transform for response
      const transformedReview = {
        ...updatedReview,
        id: updatedReview?._id.toString(),
        _id: undefined
      }
      
      console.log('Updated review:', transformedReview)
      
      return NextResponse.json({ success: true, data: transformedReview })
    }
    
    return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const reviews = db.collection('reviews')
    
    const result = await reviews.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }
    
    console.log('Deleted review with ID:', id)
    
    return NextResponse.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}