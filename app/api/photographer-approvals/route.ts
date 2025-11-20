import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Get all pending photographer registrations
    const pendingPhotographers = await studios.find({ 
      status: 'pending' 
    }).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json({
      success: true,
      photographers: pendingPhotographers.map(photographer => ({
        id: photographer._id.toString(),
        fullName: photographer.fullName,
        email: photographer.email,
        mobile: photographer.mobile,
        status: photographer.status,
        createdAt: photographer.createdAt,
        username: photographer.username
      }))
    })
    
  } catch (error) {
    console.error('Error fetching pending photographers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending photographers' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, action, adminId, adminName } = await request.json()
    
    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Find the photographer
    const photographer = await studios.findOne({ _id: new ObjectId(id) })
    if (!photographer) {
      return NextResponse.json(
        { success: false, error: 'Photographer not found' },
        { status: 404 }
      )
    }
    
    // Update photographer status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      isActive: action === 'approve',
      approvedBy: adminId || 'admin',
      approvedAt: new Date(),
      updatedAt: new Date()
    }
    
    if (adminName) {
      updateData.approvedByName = adminName
    }
    
    await studios.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    // Send notification to photographer
    try {
      const notificationType = action === 'approve' ? 'photographer_approved' : 'photographer_rejected'
      const title = action === 'approve' ? 'Account Approved!' : 'Account Rejected'
      const message = action === 'approve' 
        ? 'Congratulations! Your photographer account has been approved. You can now login and start using the platform.'
        : 'Your photographer account registration has been rejected. Please contact support for more information.'
      
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationType,
          title,
          message,
          userId: photographer._id.toString(),
          relatedId: id,
          actionRequired: false
        })
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }
    
    return NextResponse.json({
      success: true,
      message: `Photographer ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
    
  } catch (error) {
    console.error('Error updating photographer status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update photographer status' },
      { status: 500 }
    )
  }
}