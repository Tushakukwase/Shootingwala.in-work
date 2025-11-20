import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const photographers = db.collection('photographers')
    
    // Sample photographers data
    const samplePhotographers = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "+91 9876543210",
        location: "Mumbai",
        categories: ["Wedding", "Portrait"],
        image: "/placeholder.svg?height=160&width=320&query=photographer+studio",
        description: "Professional wedding photographer with 8 years of experience",
        experience: 8,
        rating: 4.8,
        isVerified: true,
        isApproved: true,
        createdBy: 'admin',
        startingPrice: 1500,
        tags: ["Wedding", "Portrait", "Traditional"],
        createdAt: new Date(),
        completedProjects: 150
      },
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 9876543211",
        location: "Delhi",
        categories: ["Fashion", "Portrait"],
        image: "/placeholder.svg?height=160&width=320&query=photographer+studio",
        description: "Fashion and portrait photographer specializing in creative shoots",
        experience: 5,
        rating: 4.6,
        isVerified: true,
        isApproved: true,
        createdBy: 'admin',
        startingPrice: 1200,
        tags: ["Fashion", "Portrait", "Creative"],
        createdAt: new Date(),
        completedProjects: 80
      },
      {
        name: "Amit Patel",
        email: "amit@example.com",
        phone: "+91 9876543212",
        location: "Bangalore",
        categories: ["Event", "Corporate"],
        image: "/placeholder.svg?height=160&width=320&query=photographer+studio",
        description: "Corporate and event photographer with modern approach",
        experience: 6,
        rating: 4.7,
        isVerified: true,
        isApproved: true,
        createdBy: 'admin',
        startingPrice: 1000,
        tags: ["Event", "Corporate", "Modern"],
        createdAt: new Date(),
        completedProjects: 120
      },
      {
        name: "Sneha Reddy",
        email: "sneha@example.com",
        phone: "+91 9876543213",
        location: "Hyderabad",
        categories: ["Wedding", "Traditional"],
        image: "/placeholder.svg?height=160&width=320&query=photographer+studio",
        description: "Traditional wedding photographer capturing cultural moments",
        experience: 10,
        rating: 4.9,
        isVerified: true,
        isApproved: true,
        createdBy: 'admin',
        startingPrice: 2000,
        tags: ["Wedding", "Traditional", "Cultural"],
        createdAt: new Date(),
        completedProjects: 200
      },
      {
        name: "Vikram Singh",
        email: "vikram@example.com",
        phone: "+91 9876543214",
        location: "Pune",
        categories: ["Nature", "Landscape"],
        image: "/placeholder.svg?height=160&width=320&query=photographer+studio",
        description: "Nature and landscape photographer with artistic vision",
        experience: 7,
        rating: 4.5,
        isVerified: true,
        isApproved: true,
        createdBy: 'admin',
        startingPrice: 800,
        tags: ["Nature", "Landscape", "Artistic"],
        createdAt: new Date(),
        completedProjects: 90
      }
    ]
    
    // Check if photographers already exist
    const existingCount = await photographers.countDocuments()
    
    if (existingCount === 0) {
      // Insert sample photographers
      const result = await photographers.insertMany(samplePhotographers)
      
      return NextResponse.json({
        success: true,
        message: `${result.insertedCount} photographers added successfully`,
        photographers: result.insertedIds
      })
    } else {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} photographers`,
        existingCount
      })
    }
    
  } catch (error) {
    console.error('Error seeding photographers:', error)
    return NextResponse.json({ error: 'Failed to seed photographers' }, { status: 500 })
  }
}