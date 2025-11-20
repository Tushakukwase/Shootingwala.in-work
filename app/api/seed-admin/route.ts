import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Check if admin already exists
    const existingAdmin = await studios.findOne({ username: 'admin' })
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists' 
      })
    }
    
    // Create admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@photobook.com',
      password: 'admin123', // In production, this should be hashed
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
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