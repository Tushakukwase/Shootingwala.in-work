import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(request: NextRequest) {
  try {
    const { id, action } = await request.json()
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID and action are required' },
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
    
    let updateData: any = {}
    
    switch (action) {
      case 'block':
        updateData = {
          status: 'suspended',
          isActive: false,
          updatedAt: new Date()
        }
        break
      case 'unblock':
        updateData = {
          status: 'approved',
          isActive: true,
          updatedAt: new Date()
        }
        break
      case 'delete':
        // For delete, we'll mark as deleted rather than actually delete
        updateData = {
          status: 'deleted',
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    await studios.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    // Send notification to photographer for block/unblock actions
    if (action === 'block' || action === 'unblock') {
      try {
        const notificationType = action === 'block' ? 'account_blocked' : 'account_unblocked'
        const title = action === 'block' ? 'Account Suspended' : 'Account Reactivated'
        const message = action === 'block' 
          ? 'Your photographer account has been suspended. Please contact support for more information.'
          : 'Your photographer account has been reactivated. You can now access your account again.'
        
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
    }
    
    const actionMessages: Record<string, string> = {
      block: 'Photographer blocked successfully',
      unblock: 'Photographer unblocked successfully',
      delete: 'Photographer deleted successfully'
    }
    
    return NextResponse.json({
      success: true,
      message: actionMessages[action]
    })
    
  } catch (error) {
    console.error('Error updating photographer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update photographer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID is required' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    const photographers = db.collection('photographers')
    
    // Find the photographer
    const photographer = await studios.findOne({ _id: new ObjectId(id) })
    if (!photographer) {
      return NextResponse.json(
        { success: false, error: 'Photographer not found' },
        { status: 404 }
      )
    }
    
    // Delete from both collections
    await Promise.all([
      studios.deleteOne({ _id: new ObjectId(id) }),
      photographers.deleteOne({ studioId: new ObjectId(id) })
    ])
    
    return NextResponse.json({
      success: true,
      message: 'Photographer deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting photographer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete photographer' },
      { status: 500 }
    )
  }
}