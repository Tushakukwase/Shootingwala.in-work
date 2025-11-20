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
        description: '',
        buttonText: 'Know More',
        buttonAction: 'redirect',
        redirectUrl: '/digital-invitations',
        isEnabled: true
      })
    }
    
    return NextResponse.json({
      imageUrl: invitationData.imageUrl || null,
      eventTitle: invitationData.eventTitle || '',
      eventDate: invitationData.eventDate || '',
      eventLocation: invitationData.eventLocation || '',
      description: invitationData.description || '',
      buttonText: invitationData.buttonText || 'Know More',
      buttonAction: invitationData.buttonAction || 'redirect',
      redirectUrl: invitationData.redirectUrl || '/digital-invitations',
      isEnabled: invitationData.isEnabled !== undefined ? invitationData.isEnabled : true
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
      buttonText: body.buttonText || 'Know More',
      buttonAction: body.buttonAction || 'redirect',
      redirectUrl: body.redirectUrl || '/digital-invitations',
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
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
        description: invitationData.description,
        buttonText: invitationData.buttonText,
        buttonAction: invitationData.buttonAction,
        redirectUrl: invitationData.redirectUrl,
        isEnabled: invitationData.isEnabled
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