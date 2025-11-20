import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const body = await request.json()
    
    const { fullName, email, phone, password } = body
    
    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Full name, email, and password are required' 
      }, { status: 400 })
    }
    
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 409 })
    }
    
    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create user
    const newUser = {
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('users').insertOne(newUser)
    
    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertedId.toString()
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}