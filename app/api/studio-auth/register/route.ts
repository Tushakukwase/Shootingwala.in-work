import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, mobile, password, emailVerified, mobileVerified } = await request.json()
    
    if (!fullName || !email || !mobile || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    if (!emailVerified || !mobileVerified) {
      return NextResponse.json(
        { success: false, error: 'Email and mobile verification required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Check if studio already exists
    const existingStudio = await studios.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobile: mobile }
      ]
    })
    
    if (existingStudio) {
      return NextResponse.json(
        { success: false, error: 'Studio with this email or mobile already exists' },
        { status: 409 }
      )
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new studio with pending approval status
    const newStudio = {
      fullName,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      username: email.toLowerCase(), // Use email as username
      emailVerified: true,
      mobileVerified: true,
      isActive: false, // Set to false until admin approval
      status: 'pending', // Add approval status
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await studios.insertOne(newStudio)
    
    // Send notification to admin for approval
    try {
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'photographer_registration',
          title: 'New Photographer Registration',
          message: `${fullName} has registered as a photographer and is waiting for approval. Email: ${email}, Mobile: ${mobile}`,
          userId: 'admin',
          relatedId: result.insertedId.toString(),
          actionRequired: true
        })
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }
    
    // Remove password from response
    const { password: _, ...studioData } = newStudio
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
      studio: { ...studioData, _id: result.insertedId }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}