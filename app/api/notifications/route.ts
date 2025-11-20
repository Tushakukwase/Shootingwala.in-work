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
    
    const allNotifications = await notifications.find(query).sort({ createdAt: -1 }).toArray()
    
    // Transform notifications to include both id and _id for compatibility
    const transformedNotifications = allNotifications.map(notification => ({
      ...notification,
      id: notification._id.toString(),
      timestamp: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown'
    }))
    
    return NextResponse.json({ success: true, notifications: transformedNotifications })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
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
    
    const result = await notifications.insertOne(newNotification)
    
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
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 })
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
      await notifications.updateMany(
        { userId: userId },
        { $set: { read: true } }
      )
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }
    
    if (id) {
      const updateData: any = {}
      if (typeof read !== 'undefined') updateData.read = read
      if (typeof actionRequired !== 'undefined') updateData.actionRequired = actionRequired
      
      const result = await notifications.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
      }
      
      const updatedNotification = await notifications.findOne({ _id: new ObjectId(id) })
      const transformedNotification = {
        ...updatedNotification,
        id: updatedNotification._id.toString(),
        timestamp: updatedNotification.createdAt ? new Date(updatedNotification.createdAt).toLocaleString() : 'Unknown'
      }
      return NextResponse.json({ success: true, notification: transformedNotification })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const notifications = db.collection('notifications')
    
    const result = await notifications.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 })
  }
}