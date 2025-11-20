import { NextRequest, NextResponse } from 'next/server'

// Mock user preferences data - in a real app, this would come from a database
const mockUserPreferences: { [key: string]: any } = {
  // Example user preferences
  'user1': {
    preferredCategories: ['Wedding', 'Portrait'],
    preferredLocation: 'Mumbai',
    priceRange: 'medium',
    recentActivity: [
      { photographerId: 'photographer1', action: 'viewed', timestamp: new Date() },
      { photographerId: 'photographer2', action: 'contacted', timestamp: new Date() }
    ],
    bookingHistory: []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // In a real application, you would:
    // 1. Validate the user authentication
    // 2. Fetch user preferences from database
    // 3. Fetch user activity/booking history
    // 4. Analyze user behavior patterns

    // For now, we'll return mock data or generate basic preferences
    let userPreferences = mockUserPreferences[userId]

    if (!userPreferences) {
      // For new users, create basic preferences based on common patterns
      userPreferences = {
        preferredCategories: [], // Empty for new users
        preferredLocation: null,
        priceRange: null,
        recentActivity: [],
        bookingHistory: [],
        isNewUser: true
      }
    }

    // Add some intelligent defaults based on user registration data
    // This could include location from registration, etc.

    return NextResponse.json(userPreferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const preferences = await request.json()

    // In a real application, you would save these preferences to the database
    mockUserPreferences[userId] = {
      ...mockUserPreferences[userId],
      ...preferences,
      updatedAt: new Date()
    }

    return NextResponse.json({ success: true, preferences: mockUserPreferences[userId] })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const activityData = await request.json()

    // Track user activity (views, contacts, bookings)
    if (!mockUserPreferences[userId]) {
      mockUserPreferences[userId] = {
        preferredCategories: [],
        preferredLocation: null,
        priceRange: null,
        recentActivity: [],
        bookingHistory: []
      }
    }

    // Add activity to recent activity
    mockUserPreferences[userId].recentActivity = mockUserPreferences[userId].recentActivity || []
    mockUserPreferences[userId].recentActivity.unshift({
      ...activityData,
      timestamp: new Date()
    })

    // Keep only last 50 activities
    if (mockUserPreferences[userId].recentActivity.length > 50) {
      mockUserPreferences[userId].recentActivity = mockUserPreferences[userId].recentActivity.slice(0, 50)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking user activity:', error)
    return NextResponse.json(
      { error: 'Failed to track user activity' },
      { status: 500 }
    )
  }
}