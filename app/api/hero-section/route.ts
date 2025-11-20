import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('hero_sections')
    
    // Get the active hero section
    const heroData = await collection.findOne({ isActive: true })
    
    if (!heroData) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }
    
    return NextResponse.json({
      success: true,
      data: heroData
    })
  } catch (error) {
    console.error('Failed to fetch hero section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero section' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('hero_sections')
    
    const body = await request.json()
    console.log('Received hero section data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.backgroundImage) {
      return NextResponse.json(
        { success: false, error: 'Background image is required' },
        { status: 400 }
      )
    }
    
    // Deactivate all existing hero sections
    await collection.updateMany({}, { $set: { isActive: false } })
    console.log('Deactivated existing hero sections')
    
    // Remove _id and id fields to avoid duplicate key errors
    const { _id, id, ...cleanBody } = body
    
    // Create new hero section
    const heroData = {
      ...cleanBody,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('Inserting hero data:', JSON.stringify(heroData, null, 2))
    const result = await collection.insertOne(heroData)
    console.log('Insert result:', result.insertedId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hero section saved successfully',
      id: result.insertedId,
      data: heroData
    })
  } catch (error) {
    console.error('Failed to save hero section:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: `Failed to save hero section: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const collection = db.collection('hero_sections')
    
    const body = await request.json()
    console.log('Updating hero section data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.backgroundImage) {
      return NextResponse.json(
        { success: false, error: 'Background image is required' },
        { status: 400 }
      )
    }
    
    // Find and update the active hero section
    const updateData = {
      ...body,
      isActive: true,
      updatedAt: new Date().toISOString()
    }
    
    // First deactivate all existing
    await collection.updateMany({}, { $set: { isActive: false } })
    
    // Then create/update the new one
    const result = await collection.replaceOne(
      { isActive: true },
      { ...updateData, createdAt: new Date().toISOString() },
      { upsert: true }
    )
    
    console.log('Update result:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hero section updated successfully',
      data: updateData
    })
  } catch (error) {
    console.error('Failed to update hero section:', error)
    console.error('Error details:', error.message)
    return NextResponse.json(
      { success: false, error: `Failed to update hero section: ${error.message}` },
      { status: 500 }
    )
  }
}