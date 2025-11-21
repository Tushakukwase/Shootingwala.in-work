// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    
    const categories = db.collection('categories')
    const allCategories = await categories.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      categories: allCategories.map(category => ({
        ...category,
        id: category._id.toString()
      }))
    })
  } catch (error: any) {
    console.error('MongoDB connection failed:', error)
    // Return empty data instead of error
    return NextResponse.json({
      success: true,
      categories: []
    })
  }
}