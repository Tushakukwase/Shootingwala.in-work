import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    
    if (!photographerId) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const packages = db.collection('photographer_packages')
    
    const photographerPackages = await packages
      .find({ photographerId })
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({
      success: true,
      packages: photographerPackages.map(pkg => ({
        ...pkg,
        id: pkg._id.toString()
      }))
    })
    
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      price,
      duration,
      description,
      features,
      deliverables,
      isPopular,
      isActive,
      photographerId
    } = body
    
    if (!name || !price || !duration || !photographerId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, duration, and photographer ID are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const packages = db.collection('photographer_packages')
    
    const newPackage = {
      name,
      price: parseFloat(price),
      duration,
      description: description || '',
      features: features || [],
      deliverables: deliverables || [],
      isPopular: isPopular || false,
      isActive: isActive !== undefined ? isActive : true,
      photographerId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await packages.insertOne(newPackage)
    
    return NextResponse.json({
      success: true,
      package: {
        ...newPackage,
        id: result.insertedId.toString()
      }
    })
    
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
}