import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Sample categories
    const sampleCategories = [
      {
        name: 'Wedding Photography',
        image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop',
        selected: true,
        createdAt: new Date()
      },
      {
        name: 'Portrait Photography',
        image: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=300&fit=crop',
        selected: true,
        createdAt: new Date()
      },
      {
        name: 'Event Photography',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
        selected: false,
        createdAt: new Date()
      }
    ]

    // Sample cities
    const sampleCities = [
      {
        name: 'New York',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
        selected: true,
        createdAt: new Date()
      },
      {
        name: 'Los Angeles',
        image: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=400&h=300&fit=crop',
        selected: true,
        createdAt: new Date()
      },
      {
        name: 'Chicago',
        image: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=400&h=300&fit=crop',
        selected: false,
        createdAt: new Date()
      }
    ]

    // Sample photographers
    const samplePhotographers = [
      {
        name: 'John Smith Photography',
        email: 'john@example.com',
        phone: '+1-555-0101',
        location: 'New York, NY',
        categories: ['Wedding Photography', 'Portrait Photography'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        description: 'Professional wedding and portrait photographer with 8+ years of experience',
        experience: 8,
        rating: 4.9,
        isVerified: true,
        isApproved: true,
        status: 'approved',
        createdBy: 'admin',
        startingPrice: 500,
        tags: ['Wedding Photography', 'Portrait Photography'],
        createdAt: new Date(),
        registrationDate: new Date()
      },
      {
        name: 'Sarah Johnson Studios',
        email: 'sarah@example.com',
        phone: '+1-555-0102',
        location: 'Los Angeles, CA',
        categories: ['Event Photography', 'Wedding Photography'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        description: 'Creative event and wedding photographer specializing in candid moments',
        experience: 5,
        rating: 4.7,
        isVerified: true,
        isApproved: true,
        status: 'approved',
        createdBy: 'admin',
        startingPrice: 400,
        tags: ['Event Photography', 'Wedding Photography'],
        createdAt: new Date(),
        registrationDate: new Date()
      }
    ]

    // Sample stories
    const sampleStories = [
      {
        title: 'A Beautiful Garden Wedding',
        content: 'Sarah and Mike celebrated their love in a stunning garden ceremony surrounded by family and friends. The natural beauty of the venue provided the perfect backdrop for their special day.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
        date: '2024-06-15',
        location: 'Botanical Gardens',
        photographer: 'John Smith Photography',
        category: 'Wedding',
        tags: ['Wedding', 'Garden', 'Outdoor'],
        status: 'approved',
        showOnHome: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Elegant City Wedding',
        content: 'Emma and David chose a sophisticated city venue for their wedding celebration. The modern architecture and urban views created a stunning contrast to the romantic ceremony.',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
        date: '2024-07-20',
        location: 'Downtown Hotel',
        photographer: 'Sarah Johnson Studios',
        category: 'Wedding',
        tags: ['Wedding', 'City', 'Modern'],
        status: 'approved',
        showOnHome: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Sample galleries
    const sampleGalleries = [
      {
        title: 'Wedding Photography',
        category: 'Wedding Photography',
        description: 'Beautiful wedding moments captured',
        images: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop'
        ],
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Portrait Photography',
        category: 'Portrait Photography',
        description: 'Professional portrait sessions',
        images: [
          'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
        ],
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert data into MongoDB
    const results = await Promise.all([
      db.collection('categories').insertMany(sampleCategories),
      db.collection('cities').insertMany(sampleCities),
      db.collection('photographers').insertMany(samplePhotographers),
      db.collection('stories').insertMany(sampleStories),
      db.collection('galleries').insertMany(sampleGalleries)
    ])

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data seeded successfully to MongoDB',
      data: {
        categories: results[0].insertedCount,
        cities: results[1].insertedCount,
        photographers: results[2].insertedCount,
        stories: results[3].insertedCount,
        galleries: results[4].insertedCount,
        total: results.reduce((sum, result) => sum + result.insertedCount, 0)
      }
    })
  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed data' }, { status: 500 })
  }
}