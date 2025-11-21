// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const client = await clientPromise
    const db = client.db('photobook')
    
    // Check if categories collection exists
    const collections = await db.listCollections({ name: 'categories' }).toArray()
    if (collections.length === 0) {
      // Return empty array if collection doesn't exist
      return NextResponse.json({
        success: true,
        categories: []
      })
    }
    
    const categories = db.collection('categories')
    
    let query: any = {};
    
    if (search) {
      query = {
        name: { $regex: search, $options: 'i' }
      };
    }
    
    const allCategories = await categories.find(query).toArray()
    
    const transformedCategories = allCategories.map(category => ({
      ...category,
      id: category._id.toString()
    }))
    
    return NextResponse.json({
      success: true,
      categories: transformedCategories
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    // Return empty array instead of error
    return NextResponse.json({
      success: true,
      categories: []
    })
  }
}