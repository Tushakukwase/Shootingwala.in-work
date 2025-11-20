import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()
    const loginIdentifier = email || username
    
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Demo accounts for testing (admin access restricted to specific email)
    const adminEmail = process.env.ADMIN_EMAIL || 'tusharkukwase24@gmail.com'
    const demoAccounts = [
      {
        _id: 'admin-demo',
        username: adminEmail,
        email: adminEmail,
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        _id: 'photographer-demo',
        username: 'photographer',
        email: 'photographer@example.com',
        password: 'photo123',
        name: 'Demo Photographer',
        role: 'photographer'
      },
      {
        _id: 'client-demo',
        username: 'client',
        email: 'client@example.com',
        password: 'client123',
        name: 'Demo Client',
        role: 'client'
      }
    ]
    
    // Check demo accounts first
    let studio = demoAccounts.find(account => 
      (account.username === loginIdentifier.toLowerCase() || account.email === loginIdentifier.toLowerCase()) &&
      account.password === password
    )
    
    // Additional security check for admin access
    if (studio && studio.role === 'admin' && studio.email !== adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access' },
        { status: 403 }
      )
    }
    
    // If not found in demo accounts, check database
    if (!studio) {
      studio = await studios.findOne({
        $or: [
          { username: loginIdentifier.toLowerCase() },
          { email: loginIdentifier.toLowerCase() }
        ]
      })
      
      if (!studio) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, studio.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      
      // Check if studio is approved
      if (studio.status === 'pending') {
        return NextResponse.json(
          { success: false, error: 'Your account is pending admin approval. Please wait for approval.' },
          { status: 403 }
        )
      }
      
      if (studio.status === 'rejected') {
        return NextResponse.json(
          { success: false, error: 'Your account has been rejected. Please contact support.' },
          { status: 403 }
        )
      }
      
      if (!studio.isActive) {
        return NextResponse.json(
          { success: false, error: 'Your account is inactive. Please contact support.' },
          { status: 403 }
        )
      }
    }
    
    // Ensure photographer record exists for this studio
    if (studio && studio.email) {
      const photographers = db.collection('photographers')
      let photographer = await photographers.findOne({ email: studio.email.toLowerCase() })
      
      if (!photographer) {
        // Create photographer record from studio data
        const newPhotographer = {
          name: studio.fullName || studio.name || studio.username || studio.photographerName || 'Photographer',
          email: studio.email.toLowerCase(),
          phone: studio.mobile || studio.mobileNumber || studio.phone || '',
          location: studio.location || '',
          categories: studio.categories || ['Wedding Photography'],
          image: studio.image || null,
          description: studio.description || studio.bio || 'Professional photographer',
          experience: studio.experience || 0,
          rating: studio.rating || 0,
          isVerified: studio.emailVerified || false,
          isApproved: studio.status === 'approved' || studio.isApproved || true,
          status: studio.status || 'approved',
          createdBy: 'studio',
          startingPrice: studio.startingPrice || 200,
          tags: studio.tags || studio.categories || ['Wedding Photography'],
          createdAt: studio.createdAt || new Date(),
          registrationDate: studio.createdAt || new Date(),
          studioId: studio._id.toString(),
          totalReviews: 0,
          totalBookings: 0,
          totalEarnings: 0,
          lastActive: new Date().toISOString(),
          verified: studio.emailVerified || false
        }
        
        const result = await photographers.insertOne(newPhotographer)
        
        // Update studio with photographer ID
        await db.collection('studios').updateOne(
          { _id: studio._id },
          { $set: { photographerId: result.insertedId } }
        )
      } else {
        // Update photographer status to match studio status
        const updateData: any = {
          lastActive: new Date().toISOString(),
          updatedAt: new Date()
        }
        
        if (studio.status && photographer.status !== studio.status) {
          updateData.status = studio.status
        }
        
        if (studio.isApproved !== undefined && photographer.isApproved !== studio.isApproved) {
          updateData.isApproved = studio.isApproved
        }
        
        if (!photographer.studioId) {
          updateData.studioId = studio._id.toString()
        }
        
        await photographers.updateOne(
          { _id: photographer._id },
          { $set: updateData }
        )
        
        // Update studio with photographer ID if missing
        if (!studio.photographerId) {
          await db.collection('studios').updateOne(
            { _id: studio._id },
            { $set: { photographerId: photographer._id } }
          )
        }
      }
    }
    
    // Remove password from response
    const { password: _, ...studioData } = studio
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      studio: studioData
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}