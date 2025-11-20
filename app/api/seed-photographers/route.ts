import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const studios = db.collection('studios')
    
    // Sample studio/photographer data with real images
    const sampleStudios = [
      {
        // Personal Information
        fullName: "Rajesh Kumar",
        photographerName: "Rajesh Kumar",
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        mobile: "+91 9876543210",
        phone: "+91 9876543210",
        location: "Mumbai",
        
        // Studio Information
        studioName: "Royal Wedding Photography",
        studioAddress: "Shop 15, Wedding Street, Bandra West",
        studioCity: "Mumbai",
        studioState: "Maharashtra",
        studioPincode: "400050",
        studioEstablished: "2015",
        studioTeamSize: 5,
        
        // Professional Information
        categories: ["Wedding", "Portrait"],
        specializations: ["Wedding", "Portrait"],
        description: "Professional wedding photographer with 8 years of experience specializing in traditional and contemporary wedding photography",
        bio: "Professional wedding photographer with 8 years of experience specializing in traditional and contemporary wedding photography",
        experience: 8,
        startingPrice: 1500,
        
        // Images
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        studioBannerImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=400&fit=crop&crop=center",
        bannerImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=400&fit=crop&crop=center",
        
        // Services & Equipment
        services: ["Wedding Photography", "Pre-wedding Shoots", "Portrait Sessions"],
        studioServices: ["Wedding Photography", "Pre-wedding Shoots", "Portrait Sessions"],
        equipment: ["Canon 5D Mark IV", "Professional Lighting", "Drone Photography"],
        studioEquipment: ["Canon 5D Mark IV", "Professional Lighting", "Drone Photography"],
        
        // Status & Verification
        isActive: true,
        status: 'approved',
        isVerified: true,
        emailVerified: true,
        mobileVerified: true,
        
        // Metadata
        rating: 4.8,
        createdBy: 'admin',
        tags: ["Wedding", "Portrait", "Traditional"],
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationDate: new Date(),
        completedProjects: 150
      },
      {
        // Personal Information
        fullName: "Priya Sharma",
        photographerName: "Priya Sharma",
        name: "Priya Sharma",
        email: "priya@example.com",
        mobile: "+91 9876543211",
        phone: "+91 9876543211",
        location: "Delhi",
        
        // Studio Information
        studioName: "Glamour Fashion Studio",
        studioAddress: "Studio 12, Fashion Hub, Connaught Place",
        studioCity: "Delhi",
        studioState: "Delhi",
        studioPincode: "110001",
        studioEstablished: "2018",
        studioTeamSize: 3,
        
        // Professional Information
        categories: ["Fashion", "Portrait"],
        specializations: ["Fashion", "Portrait"],
        description: "Fashion and portrait photographer specializing in creative shoots and model portfolios",
        bio: "Fashion and portrait photographer specializing in creative shoots and model portfolios",
        experience: 5,
        startingPrice: 1200,
        
        // Images
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        studioBannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center",
        bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center",
        
        // Services & Equipment
        services: ["Fashion Photography", "Model Portfolios", "Creative Portraits"],
        studioServices: ["Fashion Photography", "Model Portfolios", "Creative Portraits"],
        equipment: ["Sony A7R IV", "Studio Lighting", "Fashion Accessories"],
        studioEquipment: ["Sony A7R IV", "Studio Lighting", "Fashion Accessories"],
        
        // Status & Verification
        isActive: true,
        status: 'approved',
        isVerified: true,
        emailVerified: true,
        mobileVerified: true,
        
        // Metadata
        rating: 4.6,
        createdBy: 'admin',
        tags: ["Fashion", "Portrait", "Creative"],
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationDate: new Date(),
        completedProjects: 80
      },
      {
        // Personal Information
        fullName: "Amit Patel",
        photographerName: "Amit Patel",
        name: "Amit Patel",
        email: "amit@example.com",
        mobile: "+91 9876543212",
        phone: "+91 9876543212",
        location: "Bangalore",
        
        // Studio Information
        studioName: "Corporate Vision Studio",
        studioAddress: "Office 301, Tech Park, Electronic City",
        studioCity: "Bangalore",
        studioState: "Karnataka",
        studioPincode: "560100",
        studioEstablished: "2017",
        studioTeamSize: 4,
        
        // Professional Information
        categories: ["Event", "Corporate"],
        specializations: ["Event", "Corporate"],
        description: "Corporate and event photographer with modern approach to business photography",
        bio: "Corporate and event photographer with modern approach to business photography",
        experience: 6,
        startingPrice: 1000,
        
        // Images
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        studioBannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop&crop=center",
        bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop&crop=center",
        
        // Services & Equipment
        services: ["Corporate Events", "Business Portraits", "Conference Photography"],
        studioServices: ["Corporate Events", "Business Portraits", "Conference Photography"],
        equipment: ["Nikon D850", "Wireless Flash System", "Video Equipment"],
        studioEquipment: ["Nikon D850", "Wireless Flash System", "Video Equipment"],
        
        // Status & Verification
        isActive: true,
        status: 'approved',
        isVerified: true,
        emailVerified: true,
        mobileVerified: true,
        
        // Metadata
        rating: 4.7,
        createdBy: 'admin',
        tags: ["Event", "Corporate", "Modern"],
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationDate: new Date(),
        completedProjects: 120
      }
    ]
    
    // Check if studios already exist
    const existingCount = await studios.countDocuments()
    
    if (existingCount === 0) {
      // Insert sample studios
      const result = await studios.insertMany(sampleStudios)
      
      return NextResponse.json({
        success: true,
        message: `${result.insertedCount} photographer studios added successfully`,
        studios: result.insertedIds
      })
    } else {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} studios`,
        existingCount
      })
    }
    
  } catch (error) {
    console.error('Error seeding photographer studios:', error)
    return NextResponse.json({ error: 'Failed to seed photographer studios' }, { status: 500 })
  }
}