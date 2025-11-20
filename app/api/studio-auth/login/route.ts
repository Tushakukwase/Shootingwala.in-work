import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
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
      (account.username === username.toLowerCase() || account.email === username.toLowerCase()) &&
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
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      })
      
      if (!studio) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      
      // In a real app, you would hash and compare passwords
      // For demo purposes, we'll do a simple comparison
      if (studio.password !== password) {
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
          name: studio.name || studio.username || studio.photographerName || 'Photographer',
          email: studio.email.toLowerCase(),
          phone: studio.mobile || studio.mobileNumber || '',
          location: studio.location || '',
          categories: studio.categories || ['Wedding Photography'],
          image: studio.image || null,
          description: studio.description || studio.bio || 'Professional photographer',
          experience: studio.experience || 0,
          rating: studio.rating || 0,
          isVerified: studio.emailVerified || false,
          isApproved: true, // Auto-approve studio users
          status: 'approved',
          createdBy: 'studio',
          startingPrice: studio.startingPrice || 200,
          tags: studio.tags || studio.categories || ['Wedding Photography'],
          createdAt: studio.createdAt || new Date(),
          registrationDate: studio.createdAt || new Date(),
          studioId: studio._id.toString(), // Link to studio record
        }
        
        await photographers.insertOne(newPhotographer)
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