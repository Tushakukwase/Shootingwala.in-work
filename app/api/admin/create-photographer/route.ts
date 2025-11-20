import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, location, studioName, password, isApproved = true, status = 'active', createdBy = 'admin' } = body

    // Validate required fields
    if (!name || !email || !phone || !location || !studioName || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')

    // Check if email already exists in photographers collection
    const existingPhotographer = await db.collection('photographers').findOne({
      email: email.toLowerCase()
    })

    if (existingPhotographer) {
      return NextResponse.json(
        { success: false, error: 'A photographer with this email already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists in studios collection
    const existingStudio = await db.collection('studios').findOne({
      email: email.toLowerCase()
    })

    if (existingStudio) {
      return NextResponse.json(
        { success: false, error: 'A studio with this email already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create photographer record
    const photographerData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: location.trim(),
      studioName: studioName.trim(),
      isApproved,
      status,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Additional fields for photographer profile
      description: `Professional photographer at ${studioName.trim()}`,
      categories: ['Photography'],
      image: null,
      rating: 0,
      totalReviews: 0,
      isVerified: true,
      startingPrice: 500,
      tags: ['Photography']
    }

    // Create studio record for login
    const studioData = {
      fullName: name.trim(),
      name: studioName.trim(),
      photographerName: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: phone.trim(),
      username: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'photographer',
      status: 'approved',
      isApproved: true,
      isActive: true,
      emailVerified: true,
      mobileVerified: true,
      location: location.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert both records
    const [photographerResult, studioResult] = await Promise.all([
      db.collection('photographers').insertOne(photographerData),
      db.collection('studios').insertOne(studioData)
    ])

    // Link the records
    await Promise.all([
      db.collection('photographers').updateOne(
        { _id: photographerResult.insertedId },
        { $set: { studioId: studioResult.insertedId } }
      ),
      db.collection('studios').updateOne(
        { _id: studioResult.insertedId },
        { $set: { photographerId: photographerResult.insertedId } }
      )
    ])

    return NextResponse.json({
      success: true,
      message: 'Photographer created successfully',
      photographer: {
        id: photographerResult.insertedId,
        name: photographerData.name,
        email: photographerData.email,
        phone: photographerData.phone,
        location: photographerData.location,
        studioName: photographerData.studioName,
        status: photographerData.status,
        isApproved: photographerData.isApproved
      }
    })

  } catch (error) {
    console.error('Error creating photographer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create photographer' },
      { status: 500 }
    )
  }
}