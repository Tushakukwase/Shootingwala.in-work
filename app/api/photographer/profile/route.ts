import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('id')
    const email = searchParams.get('email')
    
    if (!photographerId && !email) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID or email is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    
    let query: any = {}
    
    if (photographerId && ObjectId.isValid(photographerId)) {
      query._id = new ObjectId(photographerId)
    } else if (email) {
      query.email = email.toLowerCase()
    } else if (photographerId) {
      // If ID is not a valid ObjectId, try to find by string ID
      query._id = photographerId
    }
    
    // First try to find in photographers collection
    let photographer = await db.collection('photographers').findOne(query)
    
    // If not found in photographers, try to find in studios collection and create photographer record
    if (!photographer && email) {
      const studio = await db.collection('studios').findOne({ email: email.toLowerCase() })
      
      if (studio) {
        // Create photographer record from studio data
        const newPhotographer = {
          name: studio.name || studio.username || studio.photographerName || 'Photographer',
          email: studio.email.toLowerCase(),
          phone: studio.mobile || studio.mobileNumber || '',
          location: studio.location || '',
          categories: studio.categories || ['Wedding Photography'],
          image: studio.image || null,
          description: studio.description || studio.bio || 'Professional photographer',
          experience: studio.experience || 0,
          rating: studio.rating || 0,
          isVerified: studio.emailVerified || false,
          isApproved: true, // Auto-approve studio users
          status: 'approved',
          createdBy: 'studio',
          startingPrice: studio.startingPrice || 200,
          tags: studio.tags || studio.categories || ['Wedding Photography'],
          createdAt: studio.createdAt || new Date(),
          registrationDate: studio.createdAt || new Date(),
          studioId: studio._id.toString(), // Link to studio record
        }
        
        const result = await db.collection('photographers').insertOne(newPhotographer)
        photographer = { ...newPhotographer, _id: result.insertedId }
      }
    }
    
    if (!photographer) {
      return NextResponse.json(
        { success: false, error: 'Photographer not found' },
        { status: 404 }
      )
    }
    
    // Remove sensitive data and format response
    const { password, ...photographerData } = photographer
    
    return NextResponse.json({
      success: true,
      photographer: {
        ...photographerData,
        _id: photographerData._id.toString(),
        rating: photographerData.rating || 0,
        isApproved: photographerData.isApproved || false,
        createdBy: photographerData.createdBy || 'studio',
        startingPrice: photographerData.startingPrice || 200,
        tags: photographerData.tags || photographerData.categories || [],
        experience: photographerData.experience || 0,
        completedProjects: photographerData.completedProjects || 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching photographer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photographer profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      email, 
      phone, 
      location, 
      categories, 
      image, 
      description, 
      experience, 
      startingPrice,
      bio 
    } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (phone) updateData.phone = phone
    if (location) updateData.location = location
    if (categories) updateData.categories = Array.isArray(categories) ? categories : [categories]
    if (image) updateData.image = image
    if (description || bio) updateData.description = description || bio
    if (experience !== undefined) updateData.experience = Number(experience)
    if (startingPrice !== undefined) updateData.startingPrice = Number(startingPrice)
    if (categories) updateData.tags = Array.isArray(categories) ? categories : [categories]
    
    let query: any = {}
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id)
    } else {
      query._id = id
    }
    
    const result = await db.collection('photographers').updateOne(
      query,
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Photographer not found' },
        { status: 404 }
      )
    }
    
    // Also update studio record if linked
    const photographer = await db.collection('photographers').findOne(query)
    if (photographer && photographer.studioId) {
      const studioUpdateData: any = {}
      if (name) studioUpdateData.name = name
      if (email) studioUpdateData.email = email.toLowerCase()
      if (phone) studioUpdateData.mobile = phone
      if (location) studioUpdateData.location = location
      if (description || bio) studioUpdateData.bio = description || bio
      
      await db.collection('studios').updateOne(
        { _id: new ObjectId(photographer.studioId) },
        { $set: studioUpdateData }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating photographer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update photographer profile' },
      { status: 500 }
    )
  }
}