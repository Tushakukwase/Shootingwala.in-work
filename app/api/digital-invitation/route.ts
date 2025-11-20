import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('digital_invitations')
    
    const invitationData = await collection.findOne({ type: 'main' })
    
    if (!invitationData) {
      return NextResponse.json({
        imageUrl: null,
        eventTitle: '',
        eventDate: '',
        eventLocation: '',
        description: ''
      })
    }
    
    return NextResponse.json({
      imageUrl: invitationData.imageUrl || null,
      eventTitle: invitationData.eventTitle || '',
      eventDate: invitationData.eventDate || '',
      eventLocation: invitationData.eventLocation || '',
      description: invitationData.description || ''
    })
  } catch (error) {
    console.error('Failed to fetch invitation data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitation data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('digital_invitations')
    
    const body = await request.json()
    
    const invitationData = {
      type: 'main',
      imageUrl: body.imageUrl || null,
      eventTitle: body.eventTitle || '',
      eventDate: body.eventDate || '',
      eventLocation: body.eventLocation || '',
      description: body.description || '',
      updatedAt: new Date()
    }
    
    // Upsert the invitation data (update if exists, insert if not)
    await collection.replaceOne(
      { type: 'main' },
      invitationData,
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation data saved successfully',
      data: {
        imageUrl: invitationData.imageUrl,
        eventTitle: invitationData.eventTitle,
        eventDate: invitationData.eventDate,
        eventLocation: invitationData.eventLocation,
        description: invitationData.description
      }
    })
  } catch (error) {
    console.error('Failed to save invitation data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save invitation data' },
      { status: 500 }
    )
  }
}