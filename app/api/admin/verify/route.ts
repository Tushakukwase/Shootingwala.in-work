import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check if user exists in users collection with admin role
    const users = db.collection('users')
    const adminUser = await users.findOne({ 
      email: email.toLowerCase(),
      role: 'admin'
    })
    
    if (adminUser) {
      return NextResponse.json({
        success: true,
        isAuthorizedAdmin: true,
        user: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          name: adminUser.fullName || adminUser.name,
          role: adminUser.role
        }
      })
    }
    
    // Check if user exists in studios collection with admin privileges
    const studios = db.collection('studios')
    const adminStudio = await studios.findOne({ 
      email: email.toLowerCase(),
      $or: [
        { role: 'admin' },
        { isAdmin: true },
        { adminAccess: true }
      ]
    })
    
    if (adminStudio) {
      return NextResponse.json({
        success: true,
        isAuthorizedAdmin: true,
        user: {
          id: adminStudio._id.toString(),
          email: adminStudio.email,
          name: adminStudio.name || adminStudio.fullName,
          role: 'admin'
        }
      })
    }
    
    // Default admin emails (for development)
    const defaultAdminEmails = [
      'admin@shootingwala.in',
      'admin@example.com',
      'test@admin.com',
      'tusharkukwase24@gmail.com'
    ]
    
    if (defaultAdminEmails.includes(email.toLowerCase())) {
      return NextResponse.json({
        success: true,
        isAuthorizedAdmin: true,
        user: {
          id: 'default-admin',
          email: email,
          name: 'Admin User',
          role: 'admin'
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      isAuthorizedAdmin: false,
      message: 'User is not authorized for admin access'
    })
    
  } catch (error) {
    console.error('Error verifying admin access:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to verify admin access'
    }, { status: 500 })
  }
}