import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let availability: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const date = searchParams.get('date')
    
    let filteredAvailability = availability
    
    if (photographerId) {
      filteredAvailability = filteredAvailability.filter(slot => slot.photographerId === photographerId)
    }
    
    if (date) {
      filteredAvailability = filteredAvailability.filter(slot => slot.date === date)
    }
    
    return NextResponse.json({ success: true, data: filteredAvailability })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photographerId, date, timeSlots, available } = body
    
    const newAvailability = {
      id: Date.now().toString(),
      photographerId,
      date,
      timeSlots,
      available,
      createdAt: new Date().toISOString()
    }
    
    // Remove existing availability for the same date and photographer
    availability = availability.filter(slot => 
      !(slot.photographerId === photographerId && slot.date === date)
    )
    
    availability.push(newAvailability)
    
    return NextResponse.json({ success: true, data: newAvailability })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to set availability' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const availabilityIndex = availability.findIndex(slot => slot.id === id)
    if (availabilityIndex === -1) {
      return NextResponse.json({ success: false, error: 'Availability slot not found' }, { status: 404 })
    }
    
    availability[availabilityIndex] = { ...availability[availabilityIndex], ...updates }
    
    return NextResponse.json({ success: true, data: availability[availabilityIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update availability' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Availability ID is required' }, { status: 400 })
    }
    
    const availabilityIndex = availability.findIndex(slot => slot.id === id)
    if (availabilityIndex === -1) {
      return NextResponse.json({ success: false, error: 'Availability slot not found' }, { status: 404 })
    }
    
    availability.splice(availabilityIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Availability deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete availability' }, { status: 500 })
  }
}