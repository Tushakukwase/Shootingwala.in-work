import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Get all packages
    const packages = await db.collection('photographer_packages').find({}).toArray()
    
    // Get all photographers for reference
    const photographers = await db.collection('photographers').find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: {
        totalPackages: packages.length,
        totalPhotographers: photographers.length,
        
        packages: packages.map(pkg => ({
          _id: pkg._id.toString(),
          photographerId: pkg.photographerId,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          isActive: pkg.isActive,
          features: pkg.features?.length || 0,
          deliverables: pkg.deliverables?.length || 0
        })),
        
        photographerIds: photographers.map(p => p._id.toString()),
        
        // Check if any packages match photographer IDs
        matchingPackages: packages.filter(pkg => 
          photographers.some(p => p._id.toString() === pkg.photographerId)
        ).length
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}