import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id
    const body = await request.json()
    const {
      name,
      price,
      duration,
      description,
      features,
      deliverables,
      isPopular,
      isActive
    } = body
    
    if (!name || !price || !duration) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and duration are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const packages = db.collection('photographer_packages')
    
    const updateData = {
      name,
      price: parseFloat(price),
      duration,
      description: description || '',
      features: features || [],
      deliverables: deliverables || [],
      isPopular: isPopular || false,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    }
    
    const result = await packages.updateOne(
      { _id: new ObjectId(packageId) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Package updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id
    const body = await request.json()
    
    const client = await clientPromise
    const db = client.db('photobook')
    const packages = db.collection('photographer_packages')
    
    const result = await packages.updateOne(
      { _id: new ObjectId(packageId) },
      { $set: { ...body, updatedAt: new Date() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Package updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id
    
    const client = await clientPromise
    const db = client.db('photobook')
    const packages = db.collection('photographer_packages')
    
    const result = await packages.deleteOne({ _id: new ObjectId(packageId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}