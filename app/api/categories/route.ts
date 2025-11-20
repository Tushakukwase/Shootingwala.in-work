import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const client = await clientPromise
    const db = client.db('photobook')
    const categories = db.collection('categories')
    
    let query: any = {};
    
    // Add search filter if provided
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
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, image } = body
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const categories = db.collection('categories')
    
    // Check if category already exists
    const existingCategory = await categories.findOne({ name: name.trim() })
    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category already exists'
      }, { status: 400 })
    }
    
    const newCategory = {
      name: name.trim(),
      image: image || '',
      searchCount: 0,
      isPopular: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await categories.insertOne(newCategory)
    
    return NextResponse.json({
      success: true,
      ...newCategory,
      _id: result.insertedId,
      id: result.insertedId.toString()
    })
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add category'
    }, { status: 500 })
  }
}