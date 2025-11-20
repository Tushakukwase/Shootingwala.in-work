import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const body = await request.json()
    
    const { email, password } = body
    
    // Validation
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 })
    }
    
    // Demo users for testing
    const demoUsers = [
      {
        _id: 'user-demo-1',
        fullName: 'John Smith',
        email: 'user@example.com',
        phone: '+1 (555) 123-4567',
        password: 'user123',
        isVerified: true
      },
      {
        _id: 'user-demo-2',
        fullName: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1 (555) 987-6543',
        password: 'sarah123',
        isVerified: true
      },
      {
        _id: 'user-demo-3',
        fullName: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+1 (555) 456-7890',
        password: 'mike123',
        isVerified: true
      }
    ]
    
    // Check demo users first
    let user = demoUsers.find(demoUser => 
      demoUser.email === email.toLowerCase() && demoUser.password === password
    )
    
    // If not found in demo users, check database
    if (!user) {
      const dbUser = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      })
      
      if (dbUser) {
        // Verify password for database users
        const isPasswordValid = await bcrypt.compare(password, dbUser.password)
        
        if (isPasswordValid) {
          user = dbUser
          
          // Update last login for database users
          await db.collection('users').updateOne(
            { _id: dbUser._id },
            { 
              $set: { 
                lastLogin: new Date(),
                updatedAt: new Date()
              } 
            }
          )
        }
      }
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }
    
    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified || true
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}