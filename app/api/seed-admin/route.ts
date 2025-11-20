import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@photobook.com'
    const existingAdmin = await studios.findOne({ 
      $or: [
        { username: 'admin' },
        { email: adminEmail },
        { role: 'admin' }
      ]
    })
    
    if (existingAdmin) {
      // Update existing admin with proper fields
      await studios.updateOne(
        { _id: existingAdmin._id },
        { 
          $set: {
            email: adminEmail,
            role: 'admin',
            isAdmin: true,
            adminAccess: true,
            updatedAt: new Date()
          }
        }
      )
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user updated successfully' 
      })
    }
    
    // Create admin user with email from environment
    const adminUser = {
      username: 'admin',
      email: adminEmail,
      password: 'admin123', // In production, this should be hashed
      name: 'Admin User',
      fullName: 'Admin User',
      role: 'admin',
      isAdmin: true,
      adminAccess: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await studios.insertOne(adminUser)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully' 
    })
    
  } catch (error) {
    console.error('Error seeding admin:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed admin user' 
    }, { status: 500 })
  }
}