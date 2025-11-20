import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Initialize sample categories
    const categoriesCollection = db.collection('categories')
    const existingCategories = await categoriesCollection.countDocuments()
    
    if (existingCategories === 0) {
      await categoriesCollection.insertMany([
        {
          name: 'Wedding Photography',
          image: '/placeholder.svg?height=200&width=200&query=wedding',
          selected: true,
          searchCount: 150,
          isPopular: true,
          createdAt: new Date()
        },
        {
          name: 'Portrait Photography',
          image: '/placeholder.svg?height=200&width=200&query=portrait',
          selected: true,
          searchCount: 120,
          isPopular: true,
          createdAt: new Date()
        },
        {
          name: 'Event Photography',
          image: '/placeholder.svg?height=200&width=200&query=event',
          selected: false,
          searchCount: 80,
          isPopular: false,
          createdAt: new Date()
        }
      ])
    }
    
    // Initialize sample cities
    const citiesCollection = db.collection('cities')
    const existingCities = await citiesCollection.countDocuments()
    
    if (existingCities === 0) {
      await citiesCollection.insertMany([
        {
          name: 'Mumbai',
          image: '/placeholder.svg?height=200&width=200&query=mumbai',
          selected: true,
          searchCount: 200,
          isPopular: true,
          createdAt: new Date()
        },
        {
          name: 'Delhi',
          image: '/placeholder.svg?height=200&width=200&query=delhi',
          selected: true,
          searchCount: 180,
          isPopular: true,
          createdAt: new Date()
        },
        {
          name: 'Bangalore',
          image: '/placeholder.svg?height=200&width=200&query=bangalore',
          selected: false,
          searchCount: 100,
          isPopular: false,
          createdAt: new Date()
        }
      ])
    }
    
    // Initialize sample photographers
    const photographersCollection = db.collection('photographers')
    const existingPhotographers = await photographersCollection.countDocuments()
    
    if (existingPhotographers === 0) {
      await photographersCollection.insertMany([
        {
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 9876543210',
          location: 'Mumbai',
          categories: ['Wedding Photography', 'Portrait Photography'],
          image: '/placeholder.svg?height=200&width=200&query=photographer',
          description: 'Professional wedding and portrait photographer with 10+ years experience',
          experience: 10,
          rating: 4.8,
          isVerified: true,
          createdAt: new Date()
        },
        {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 9876543211',
          location: 'Delhi',
          categories: ['Event Photography', 'Portrait Photography'],
          image: '/placeholder.svg?height=200&width=200&query=photographer',
          description: 'Creative event photographer specializing in corporate and social events',
          experience: 7,
          rating: 4.6,
          isVerified: true,
          createdAt: new Date()
        }
      ])
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully with sample data',
      collections: {
        categories: await categoriesCollection.countDocuments(),
        cities: await citiesCollection.countDocuments(),
        photographers: await photographersCollection.countDocuments()
      }
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}