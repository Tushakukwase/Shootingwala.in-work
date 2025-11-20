import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let categorySuggestions: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected'
    
    let filteredSuggestions = categorySuggestions
    if (status) {
      filteredSuggestions = categorySuggestions.filter(suggestion => suggestion.status === status)
    }
    
    return NextResponse.json({ success: true, data: filteredSuggestions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch category suggestions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, photographerId, photographerName } = body
    
    const newSuggestion = {
      id: Date.now().toString(),
      name,
      description,
      photographerId,
      photographerName,
      status: 'pending',
      suggestedBy: photographerId,
      approvedBy: null,
      createdAt: new Date().toISOString(),
      approvedAt: null
    }
    
    categorySuggestions.push(newSuggestion)
    
    // Create notification for admin
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category_suggestion',
          title: 'New Category Suggestion',
          message: `${photographerName} suggested a new category: "${name}"`,
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
    return NextResponse.json({ success: false, error: 'Failed to create category suggestion' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, adminId, adminName } = body
    
    const suggestionIndex = categorySuggestions.findIndex(suggestion => suggestion.id === id)
    if (suggestionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 })
    }
    
    const suggestion = categorySuggestions[suggestionIndex]
    suggestion.status = action === 'approve' ? 'approved' : 'rejected'
    suggestion.approvedBy = adminId
    suggestion.adminName = adminName
    suggestion.approvedAt = new Date().toISOString()
    
    if (action === 'approve') {
      // Add to main categories via the existing categories API
      try {
        await fetch(`${request.nextUrl.origin}/api/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: suggestion.name,
            image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop' // Default image
          })
        })
      } catch (categoryError) {
        console.error('Failed to create category:', categoryError)
      }
      
      // Notify photographer
      try {
        await fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'category_approved',
            title: 'Category Suggestion Approved',
            message: `Your category suggestion "${suggestion.name}" has been approved!`,
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
            type: 'category_rejected',
            title: 'Category Suggestion Rejected',
            message: `Your category suggestion "${suggestion.name}" has been rejected.`,
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
    
    const suggestionIndex = categorySuggestions.findIndex(suggestion => suggestion.id === id)
    if (suggestionIndex === -1) {
      return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 })
    }
    
    categorySuggestions.splice(suggestionIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Suggestion deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete suggestion' }, { status: 500 })
  }
}