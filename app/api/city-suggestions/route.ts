import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let citySuggestions: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected'
    
    let filteredSuggestions = citySuggestions
    if (status) {
      filteredSuggestions = citySuggestions.filter(suggestion => suggestion.status === status)
    }
    
    return NextResponse.json({ success: true, data: filteredSuggestions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch city suggestions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, state, country, photographerId, photographerName } = body
    
    const newSuggestion = {
      id: Date.now().toString(),
      name,
      state,
      country,
      photographerId,
      photographerName,
      status: 'pending',
      suggestedBy: photographerId,
      approvedBy: null,
      createdAt: new Date().toISOString(),
      approvedAt: null
    }
    
    citySuggestions.push(newSuggestion)
    
    // Create notification for admin
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'city_suggestion',
          title: 'New City Coverage Request',
          message: `${photographerName} requested to add coverage for ${name}, ${state}`,
          userId: 'admin',
          relatedId: newSuggestion.id,
          actionRequired: true
        })
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }
    
    return NextResponse.json({ success: true, data: newSuggestion })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create city suggestion' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, adminId, adminName } = body
    
    const suggestionIndex = citySuggestions.findIndex(suggestion => suggestion.id === id)
    if (suggestionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 })
    }
    
    const suggestion = citySuggestions[suggestionIndex]
    suggestion.status = action === 'approve' ? 'approved' : 'rejected'
    suggestion.approvedBy = adminId
    suggestion.adminName = adminName
    suggestion.approvedAt = new Date().toISOString()
    
    if (action === 'approve') {
      // Add to main cities via the existing cities API
      try {
        await fetch(`${request.nextUrl.origin}/api/cities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: suggestion.name,
            state: suggestion.state,
            country: suggestion.country,
            active: true
          })
        })
      } catch (cityError) {
        console.error('Failed to create city:', cityError)
      }
      
      // Notify photographer
      try {
        await fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'city_approved',
            title: 'City Coverage Request Approved',
            message: `Your request to add coverage for ${suggestion.name}, ${suggestion.state} has been approved!`,
            userId: suggestion.photographerId,
            relatedId: suggestion.id,
            actionRequired: false
          })
        })
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError)
      }
    } else {
      // Notify photographer of rejection
      try {
        await fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'city_rejected',
            title: 'City Coverage Request Rejected',
            message: `Your request to add coverage for ${suggestion.name}, ${suggestion.state} has been rejected.`,
            userId: suggestion.photographerId,
            relatedId: suggestion.id,
            actionRequired: false
          })
        })
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError)
      }
    }
    
    return NextResponse.json({ success: true, data: suggestion })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update suggestion' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Suggestion ID is required' }, { status: 400 })
    }
    
    const suggestionIndex = citySuggestions.findIndex(suggestion => suggestion.id === id)
    if (suggestionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 })
    }
    
    citySuggestions.splice(suggestionIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Suggestion deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete suggestion' }, { status: 500 })
  }
}