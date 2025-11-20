import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let bookings: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const status = searchParams.get('status')
    
    let filteredBookings = bookings
    
    if (photographerId) {
      filteredBookings = filteredBookings.filter(booking => booking.photographerId === photographerId)
    }
    
    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status)
    }
    
    return NextResponse.json({ success: true, data: filteredBookings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      photographerId, 
      clientName, 
      clientEmail, 
      clientPhone, 
      eventName, 
      date, 
      time, 
      duration, 
      location, 
      notes 
    } = body
    
    const newBooking = {
      id: Date.now().toString(),
      photographerId,
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      date,
      time,
      duration,
      location,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalAmount: 0
    }
    
    bookings.push(newBooking)
    
    return NextResponse.json({ success: true, data: newBooking })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const bookingIndex = bookings.findIndex(booking => booking.id === id)
    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    
    bookings[bookingIndex] = { ...bookings[bookingIndex], ...updates }
    
    return NextResponse.json({ success: true, data: bookings[bookingIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 })
    }
    
    const bookingIndex = bookings.findIndex(booking => booking.id === id)
    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    
    bookings.splice(bookingIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 })
  }
}