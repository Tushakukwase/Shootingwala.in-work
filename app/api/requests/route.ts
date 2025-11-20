import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'category' or 'city'
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected'
    const createdBy = searchParams.get('created_by') // 'admin' or 'photographer'
    
    const client = await clientPromise
    const db = client.db('photobook')
    const requests = db.collection('requests')
    
    let query: any = {}
    
    if (type) {
      query.type = type
    }
    
    if (status) {
      query.status = status
    }
    
    if (createdBy) {
      query.created_by = createdBy
    }
    
    const allRequests = await requests.find(query).sort({ created_at: -1 }).toArray()
    
    return NextResponse.json({ success: true, requests: allRequests })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      name, 
      description, 
      state, 
      country, 
      photographerId, 
      photographerName, 
      created_by = 'photographer',
      created_by_name,
      image 
    } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const requests = db.collection('requests')
    
    const newRequest = {
      type,
      name,
      description: description || '',
      state: state || '',
      country: country || '',
      image_url: image || '',
      photographerId: photographerId || 'admin',
      photographerName: photographerName || 'Admin',
      created_by,
      created_by_name: created_by_name || photographerName || 'Admin',
      status: created_by === 'admin' ? 'approved' : 'pending',
      show_on_home: created_by === 'admin' ? true : false,
      suggestedBy: photographerId || 'admin',
      approvedBy: created_by === 'admin' ? 'admin' : null,
      adminName: created_by === 'admin' ? 'Admin' : null,
      created_at: new Date(),
      approved_at: created_by === 'admin' ? new Date() : null
    }
    
    const result = await requests.insertOne(newRequest)
    const createdRequest = { ...newRequest, _id: result.insertedId }
    
    // Create notification for admin if it's a photographer request
    if (created_by === 'photographer') {
      try {
        await fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type === 'category' ? 'category_suggestion' : 'city_suggestion',
            title: type === 'category' ? 'New Category Suggestion' : 'New City Coverage Request',
            message: type === 'category' 
              ? `${photographerName} suggested a new category: "${name}"`
              : `${photographerName} requested to add coverage for ${name}${state ? `, ${state}` : ''}`,
            userId: 'admin',
            relatedId: result.insertedId.toString(),
            actionRequired: true
          })
        })
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError)
      }
    }
    
    return NextResponse.json({ success: true, request: createdRequest })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, adminId, adminName, show_on_home, ...updates } = body
    
    const client = await clientPromise
    const db = client.db('photobook')
    const requests = db.collection('requests')
    
    const req = await requests.findOne({ _id: new ObjectId(id) })
    if (!req) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }
    
    let updateData: any = {}
    
    if (action === 'approve' || action === 'reject') {
      // Handle approval/rejection
      updateData.status = action === 'approve' ? 'approved' : 'rejected'
      updateData.approvedBy = adminId || 'admin'
      updateData.adminName = adminName || 'Admin'
      updateData.approved_at = new Date()
      
      if (action === 'approve') {
        // Set show_on_home if provided
        if (show_on_home !== undefined) {
          updateData.show_on_home = show_on_home
        }
        
        // Add to main collection (categories or cities)
        try {
          const targetApi = req.type === 'category' ? '/api/categories' : '/api/cities'
          const payload = req.type === 'category' 
            ? { 
                name: req.name, 
                image: req.image_url || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop'
              }
            : { 
                name: req.name, 
                image: req.image_url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
              }
          
          const response = await fetch(`${request.nextUrl.origin}${targetApi}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          
          if (!response.ok) {
            console.error(`Failed to create ${req.type}: ${response.status} ${response.statusText}`)
          }
        } catch (error) {
          console.error(`Failed to create ${req.type}:`, error)
        }
        
        // Notify photographer of approval
        try {
          await fetch(`${request.nextUrl.origin}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: req.type === 'category' ? 'category_approved' : 'city_approved',
              title: req.type === 'category' ? 'Category Suggestion Approved' : 'City Coverage Request Approved',
              message: req.type === 'category'
                ? `Your category suggestion "${req.name}" has been approved!`
                : `Your request to add coverage for ${req.name}${req.state ? `, ${req.state}` : ''} has been approved!`,
              userId: req.photographerId,
              relatedId: id,
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
              type: req.type === 'category' ? 'category_rejected' : 'city_rejected',
              title: req.type === 'category' ? 'Category Suggestion Rejected' : 'City Coverage Request Rejected',
              message: req.type === 'category'
                ? `Your category suggestion "${req.name}" has been rejected.`
                : `Your request to add coverage for ${req.name}${req.state ? `, ${req.state}` : ''} has been rejected.`,
              userId: req.photographerId,
              relatedId: id,
              actionRequired: false
            })
          })
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError)
        }
      }
    } else {
      // Handle regular updates
      updateData = { ...updates }
      
      // Handle show_on_home update specifically
      if (show_on_home !== undefined) {
        updateData.show_on_home = show_on_home
      }
      
      updateData.updated_at = new Date()
    }
    
    await requests.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    const updatedRequest = await requests.findOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const requests = db.collection('requests')
    
    const result = await requests.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Request deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete request' }, { status: 500 })
  }
}