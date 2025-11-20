import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let reviews: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const approved = searchParams.get('approved')
    
    let filteredReviews = reviews
    
    if (photographerId) {
      filteredReviews = filteredReviews.filter(review => review.photographerId === photographerId)
    }
    
    if (approved !== null) {
      filteredReviews = filteredReviews.filter(review => review.approved === (approved === 'true'))
    }
    
    return NextResponse.json({ success: true, data: filteredReviews })
  } catch (error) {
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
      bookingId 
    } = body
    
    const newReview = {
      id: Date.now().toString(),
      photographerId,
      clientName,
      clientEmail,
      rating,
      comment,
      bookingId,
      approved: false,
      createdAt: new Date().toISOString(),
      response: null
    }
    
    reviews.push(newReview)
    
    return NextResponse.json({ success: true, data: newReview })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const reviewIndex = reviews.findIndex(review => review.id === id)
    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }
    
    reviews[reviewIndex] = { ...reviews[reviewIndex], ...updates }
    
    return NextResponse.json({ success: true, data: reviews[reviewIndex] })
  } catch (error) {
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
    
    const reviewIndex = reviews.findIndex(review => review.id === id)
    if (reviewIndex === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }
    
    reviews.splice(reviewIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}