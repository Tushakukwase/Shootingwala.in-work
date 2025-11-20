import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const suggestions = db.collection('category_suggestions')
    
    const allSuggestions = await suggestions.find({}).sort({ created_at: -1 }).toArray()
    
    const transformedSuggestions = allSuggestions.map(suggestion => ({
      ...suggestion,
      id: suggestion._id.toString()
    }))
    
    return NextResponse.json({
      success: true,
      suggestions: transformedSuggestions
    })
  } catch (error) {
    console.error('Error fetching category suggestions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch category suggestions'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image_url, photographerId, photographerName } = body
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const suggestions = db.collection('category_suggestions')
    
    const newSuggestion = {
      name: name.trim(),
      description: description || '',
      image_url: image_url || '',
      photographerId: photographerId || 'admin',
      photographerName: photographerName || 'Admin',
      status: 'pending',
      show_on_home: false,
      suggestedBy: photographerId || 'admin',
      created_by: photographerId ? 'photographer' : 'admin',
      created_by_name: photographerName || 'Admin',
      created_at: new Date().toISOString(),
      updatedAt: new Date()
    }
    
    const result = await suggestions.insertOne(newSuggestion)
    
    return NextResponse.json({
      success: true,
      suggestion: {
        ...newSuggestion,
        _id: result.insertedId,
        id: result.insertedId.toString()
      }
    })
  } catch (error) {
    console.error('Error adding category suggestion:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add category suggestion'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, approvedBy, adminName } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Suggestion ID is required'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const suggestions = db.collection('category_suggestions')
    
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (status) {
      updateData.status = status
      if (status === 'approved' || status === 'rejected') {
        updateData.approvedBy = approvedBy || 'admin'
        updateData.adminName = adminName || 'Admin'
        updateData.approved_at = new Date().toISOString()
      }
    }
    
    const result = await suggestions.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Suggestion not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Suggestion updated successfully'
    })
  } catch (error) {
    console.error('Error updating category suggestion:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update category suggestion'
    }, { status: 500 })
  }
}