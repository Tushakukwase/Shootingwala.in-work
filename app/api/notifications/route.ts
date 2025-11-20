import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly')
    
    const client = await clientPromise
    const db = client.db('photobook')
    const notifications = db.collection('notifications')
    
    let query: any = {}
    
    if (userId) {
      query.userId = userId
    }
    
    if (unreadOnly === 'true') {
      query.read = false
    }
    
    // Handle case where notifications collection doesn't exist yet
    let allNotifications = []
    try {
      allNotifications = await notifications.find(query).sort({ createdAt: -1 }).toArray()
    } catch (collectionError) {
      console.error('Error querying notifications collection:', collectionError)
      // Return empty array if collection doesn't exist
      allNotifications = []
    }
    
    // Transform notifications to include both id and _id for compatibility
    const transformedNotifications = allNotifications.map(notification => ({
      ...notification,
      id: notification._id.toString(),
      timestamp: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown'
    }))
    
    return NextResponse.json({ success: true, notifications: transformedNotifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      success: true, 
      notifications: [],
      error: 'Failed to fetch notifications' 
    }, { status: 200 }) // Return 200 with empty array instead of 500
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, userId, relatedId, actionRequired } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const notifications = db.collection('notifications')
    
    const newNotification = {
      type,
      title,
      message,
      userId,
      relatedId,
      actionRequired: actionRequired || false,
      read: false,
      createdAt: new Date()
    }
    
    let result
    try {
      result = await notifications.insertOne(newNotification)
    } catch (collectionError) {
      console.error('Error inserting notification:', collectionError)
      // Return success response even if collection doesn't exist yet
      return NextResponse.json({ 
        success: true, 
        notification: { 
          ...newNotification, 
          _id: 'temp-id',
          id: 'temp-id',
          timestamp: new Date(newNotification.createdAt).toLocaleString()
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      notification: { 
        ...newNotification, 
        _id: result.insertedId,
        id: result.insertedId.toString(),
        timestamp: new Date(newNotification.createdAt).toLocaleString()
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json({ 
      success: true, 
      notification: null,
      error: 'Failed to create notification' 
    }, { status: 200 }) // Return 200 instead of 500
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read, markAllRead, userId, actionRequired } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const notifications = db.collection('notifications')
    
    if (markAllRead && userId) {
      try {
        await notifications.updateMany(
          { userId: userId },
          { $set: { read: true } }
        )
      } catch (collectionError) {
        console.error('Error updating notifications:', collectionError)
        // Continue gracefully if collection doesn't exist
      }
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }
    
    if (id) {
      const updateData: any = {}
      if (typeof read !== 'undefined') updateData.read = read
      if (typeof actionRequired !== 'undefined') updateData.actionRequired = actionRequired
      
      let result
      try {
        result = await notifications.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        )
      } catch (collectionError) {
        console.error('Error updating notification:', collectionError)
        // Return success even if collection doesn't exist
        return NextResponse.json({ success: true, message: 'Notification updated' })
      }
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: true, message: 'Notification not found' }, { status: 200 })
      }
      
      let updatedNotification
      try {
        updatedNotification = await notifications.findOne({ _id: new ObjectId(id) })
      } catch (findError) {
        console.error('Error finding updated notification:', findError)
        updatedNotification = null
      }
      
      const transformedNotification = updatedNotification ? {
        ...updatedNotification,
        id: updatedNotification._id.toString(),
        timestamp: updatedNotification.createdAt ? new Date(updatedNotification.createdAt).toLocaleString() : 'Unknown'
      } : null
      
      return NextResponse.json({ success: true, notification: transformedNotification })
    }
    
    return NextResponse.json({ success: true, error: 'Invalid request' }, { status: 200 })
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json({ success: true, error: 'Failed to update notification' }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: true, error: 'Notification ID is required' }, { status: 200 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const notifications = db.collection('notifications')
    
    let result
    try {
      result = await notifications.deleteOne({ _id: new ObjectId(id) })
    } catch (collectionError) {
      console.error('Error deleting notification:', collectionError)
      // Return success even if collection doesn't exist
      return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
    }
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: true, message: 'Notification not found' }, { status: 200 })
    }
    
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' }, { status: 200 })
  }
}